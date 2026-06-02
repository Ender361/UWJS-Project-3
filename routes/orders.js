import express from 'express';
import Order from '../models/orderModel.js';
import MenuItem from '../models/menuItemModel.js';
import { authRequired, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.use(authRequired);

router.get('/stats/summary', adminOnly, async (req, res) => {
	const summary = await Order.aggregate([
		{
			$project: {
				status: 1,
				orderTotal: {
					$sum: {
						$map: {
							input: '$items',
							as: 'item',
							in: {
								$multiply: ['$$item.price', '$$item.quantity'],
							},
						},
					},
				},
			},
		},
		{
			$group: {
				_id: '$status',
				orders: { $sum: 1 },
				revenue: { $sum: '$orderTotal' },
			},
		},
		{
			$sort: { _id: 1 },
		},
	]);

	return res.json({ summary });
});

router.get('/', async (req, res) => {
	const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
	const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
	return res.json({ orders });
});

router.get('/:id', async (req, res) => {
	const order = await Order.findById(req.params.id).lean();

	if (!order) {
		return res.status(404).json({ message: 'Order not found' });
	}

	if (req.user.role !== 'admin' && String(order.user) !== String(req.user._id)) {
		return res.status(403).json({ message: 'Not allowed to view this order' });
	}

	return res.json({ order });
});

router.post('/', async (req, res) => {
	const { items = [], notes = '' } = req.body;

	if (!Array.isArray(items) || items.length === 0) {
		return res.status(400).json({ message: 'items must be a non-empty array' });
	}

	const normalizedItems = [];
	for (const item of items) {
		const { menuItemId, quantity = 1 } = item;
		if (!menuItemId) {
			return res.status(400).json({ message: 'Each order item needs a menuItemId' });
		}

		const menuItem = await MenuItem.findById(menuItemId).lean();
		if (!menuItem) {
			return res.status(400).json({ message: `Menu item ${menuItemId} not found` });
		}

		normalizedItems.push({
			menuItemId: menuItem._id,
			name: menuItem.name,
			price: menuItem.price,
			quantity,
		});
	}

	const order = await Order.create({
		user: req.user._id,
		items: normalizedItems,
		notes,
	});

	return res.status(201).json({ order });
});

router.patch('/:id', async (req, res) => {
	const order = await Order.findById(req.params.id);

	if (!order) {
		return res.status(404).json({ message: 'Order not found' });
	}

	if (req.user.role !== 'admin' && String(order.user) !== String(req.user._id)) {
		return res.status(403).json({ message: 'Not allowed to update this order' });
	}

	if (req.user.role === 'admin' && req.body.status) {
		order.status = req.body.status;
	}

	if (req.body.notes !== undefined && String(order.user) === String(req.user._id)) {
		order.notes = req.body.notes;
	}

	await order.save();
	return res.json({ order });
});

router.delete('/:id', adminOnly, async (req, res) => {
	const order = await Order.findByIdAndDelete(req.params.id).lean();

	if (!order) {
		return res.status(404).json({ message: 'Order not found' });
	}

	return res.json({ message: 'Order deleted', order });
});

export default router;