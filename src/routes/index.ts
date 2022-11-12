import { Router } from 'express';
import userRouter from './userRoute';
import customerRouter from './customerRoute';

const router = Router();

router.use('/users', userRouter);
router.use('/customers', customerRouter);

export default router;