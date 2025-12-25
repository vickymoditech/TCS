import { Router } from 'express';
import cart from './cart';

const router = Router();

router.use('/api', cart);

export default router;
