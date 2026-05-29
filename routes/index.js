// Basic starter route
import express from 'express';
const router = express.Router();

router.get('/test', (req, res) => {
  res.json({ message: 'Routes are working!' });
});

export default router;
