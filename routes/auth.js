import express from 'express';
import User from '../models/userModel.js';
import { createToken } from '../utils/auth.js';
import { authRequired, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', async (req, res) => {
	const { name, email, password, role } = req.body;

	if (!name || !email || !password) {
		return res.status(400).json({ message: 'name, email, and password are required' });
	}

	const existingUser = await User.findOne({ email: email.toLowerCase() });
	if (existingUser) {
		return res.status(409).json({ message: 'Email already exists' });
	}

	const user = new User({
		name,
		email,
		role: role === 'admin' ? 'admin' : 'user',
	});
	user.setPassword(password);
	await user.save();

	const token = createToken({ userId: user._id.toString(), role: user.role });

	return res.status(201).json({
		message: 'User registered successfully',
		token,
		user: {
			id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
		},
	});
});

router.post('/login', async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({ message: 'email and password are required' });
	}

	const user = await User.findOne({ email: email.toLowerCase() });
	if (!user || !user.verifyPassword(password)) {
		return res.status(401).json({ message: 'Invalid email or password' });
	}

	const token = createToken({ userId: user._id.toString(), role: user.role });

	return res.json({
		message: 'Login successful',
		token,
		user: {
			id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
		},
	});
});

router.get('/me', authRequired, (req, res) => {
	return res.json({
		message: 'Current user profile',
		user: req.user,
	});
});

router.get('/admin-check', authRequired, adminOnly, (req, res) => {
	return res.json({
		message: 'Admin access confirmed',
		user: req.user,
	});
});

export default router;