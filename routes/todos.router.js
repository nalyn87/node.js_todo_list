import express from 'express';
import todoSchemas from '../schemas/todo.schemas.js';
import Todo from '../schemas/todo.schemas.js';
import joi from 'joi';

const router = express.Router();

const createdTodoSchema = joi.object({
  value: joi.string().min(1).max(50).required(),
});

// 할 일 등록 API
router.post('/todos', async (req, res, next) => {
  try {
    const validation = await createdTodoSchema.validateAsync(req.body);

    const { value } = validation;

    if (!value) {
      return res.status(400).json({
        errorMessage: '해야할 일(Value) 데이터가 존재하지 않습니다.',
      });
    }

    // findOne = 1개의 데이터만 조회함
    const todoMaxOrder = await Todo.findOne().sort('-order').exec();
    const order = todoMaxOrder ? todoMaxOrder.order + 1 : 1;

    const todo = new Todo({ value, order });
    await todo.save();

    return res.status(201).json({ value, order });
  } catch (error) {
    next(error);
  }
});

// 해야할 일 목록 조회 API
router.get('/todos', async (req, res) => {
  const todos = await Todo.find().sort('-order').exec();
  return res.status(200).json({ todos });
});

// 순서 변경, 완료 / 해제, 내용 수정 API
router.patch('/todos/:todoId', async (req, res) => {
  const { todoId } = req.params;
  const { order, done, value } = req.body;

  const currentTodo = await Todo.findById(todoId).exec();

  // 순서 변경 API
  if (!currentTodo) {
    return res
      .status(404)
      .json({ errorMessage: '존재하지 않는 해야할 일 입니다.' });
  }

  if (order) {
    const targetTodo = await Todo.findOne({ order: order }).exec();
    if (targetTodo) {
      targetTodo.order = currentTodo.order;
      await targetTodo.save();
    }

    currentTodo.order = order;
  }

  // 완료 / 해제 API
  if (done !== undefined) {
    currentTodo.doneAt = done ? new Date() : null;
  }

  // 내용 수정 API
  if (value) {
    currentTodo.value = value;
  }

  await currentTodo.save();

  return res.status(200).json({});
});

// 할 일 삭제 API
router.delete('/todos/:todoId', async (req, res) => {
  const { todoId } = req.params;

  const todo = await Todo.findById(todoId).exec();
  if (!todo) {
    return res
      .status(404)
      .json({ errorMessage: '존재하지 않는 해야할 일 정보입니다!!!!' });
  }

  await Todo.deleteOne({ _id: todoId });

  return res.status(200).json({});
});

export default router;
