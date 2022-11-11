import { Router } from 'express';
import userRouter from './userRoute';

const router = Router();

router.use('/users', userRouter);

export default router;