import express from 'express';
import connect from './schemas/index.js';
import todosRouter from './routes/todos.router.js';
import errorHandlerMiddleware from './middlewares/error_handler_middleware.js';

const app = express();
const PORT = 3000;

connect();

// Express에서 req.body에 접근하여 body 데이터를 사용할 수 있도록 설정합니다.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// html 서빙하는 함수
app.use(express.static('./assets'));

const router = express.Router();

router.get('/', (req, res) => {
  return res.json({ message: 'Hi!' });
});

// 라우터 미들웨어 등록
app.use('/api', [router, todosRouter]);

// 에러 처리 미들웨어 등록
app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});
