import { Router } from 'express';
import userRouter from './userRoute';
import customerRouter from './customerRoute';
import CRUDrouter from './booksCRUDroute';

const router = Router();

router.use('/users', userRouter);
router.use('/customers', customerRouter);
router.use('/books', CRUDrouter);

export default router;