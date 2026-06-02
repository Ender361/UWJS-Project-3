import express from 'express';
import MenuItem from '../models/menuItemModel.js';
import { authRequired, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
	const items = await MenuItem.find().sort({ name: 1 }).lean();
	return res.json({ items });
});

router.get('/search', async (req, res) => {
	const query = String(req.query.q || '').trim();

	if (!query) {
		const items = await MenuItem.find().sort({ name: 1 }).lean();
		return res.json({ items });
	}

	const items = await MenuItem.find(
		{ $text: { $search: query } },
		{ score: { $meta: 'textScore' } },
	)
		.sort({ score: { $meta: 'textScore' } })
		.lean();

	return res.json({ items });
});

router.get('/:id', async (req, res) => {
	const item = await MenuItem.findById(req.params.id).lean();

	if (!item) {
		return res.status(404).json({ message: 'Menu item not found' });
	}

	return res.json({ item });
});

router.post('/', authRequired, adminOnly, async (req, res) => {
	const { name, description = '', price, category = 'coffee', available = true } = req.body;

	if (!name || price === undefined) {
		return res.status(400).json({ message: 'name and price are required' });
	}

	const item = await MenuItem.create({ name, description, price, category, available });
	return res.status(201).json({ item });
});

router.patch('/:id', authRequired, adminOnly, async (req, res) => {
	const updates = {};
	for (const field of ['name', 'description', 'price', 'category', 'available']) {
		if (req.body[field] !== undefined) {
			updates[field] = req.body[field];
		}
	}

	const item = await MenuItem.findByIdAndUpdate(req.params.id, updates, {
		runValidators: true,
		new: true,
	}).lean();

	if (!item) {
		return res.status(404).json({ message: 'Menu item not found' });
	}

	return res.json({ item });
});

router.delete('/:id', authRequired, adminOnly, async (req, res) => {
	const item = await MenuItem.findByIdAndDelete(req.params.id).lean();

	if (!item) {
		return res.status(404).json({ message: 'Menu item not found' });
	}

	return res.json({ message: 'Menu item deleted', item });
});

export default router;