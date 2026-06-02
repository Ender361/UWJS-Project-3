import express from 'express';
import authRoutes from './auth.js';
import menuRoutes from './menu.js';
import orderRoutes from './orders.js';
const router = express.Router();

router.get('/test', (req, res) => {
  res.json({ message: 'API is up' });
});

router.get('/health', (req, res) => {
  res.json({ ok: true });
});

router.use('/auth', authRoutes);
router.use('/menu', menuRoutes);
router.use('/orders', orderRoutes);

export default router;
