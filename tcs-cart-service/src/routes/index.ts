import { Router } from 'express';
import cart from './cart';

const router = Router();

/** Top-level router that mounts API sub-routers. */
router.use('/api', cart);

export default router; 
