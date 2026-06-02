import { verifyToken } from '../utils/auth.js';
import User from '../models/userModel.js';

export async function authRequired(req, res, next) {
	const authHeader = req.get('authorization');

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({ message: 'Missing authorization token' });
	}

	const token = authHeader.slice('Bearer '.length).trim();

	try {
		const payload = verifyToken(token);
		const user = await User.findById(payload.userId).lean();

		if (!user) {
			return res.status(401).json({ message: 'Invalid token user' });
		}

		req.user = user;
		return next();
	} catch (error) {
		return res.status(401).json({ message: 'Invalid or expired token' });
	}
}

export function adminOnly(req, res, next) {
	if (!req.user || req.user.role !== 'admin') {
		return res.status(403).json({ message: 'Admin access required' });
	}

	return next();
}