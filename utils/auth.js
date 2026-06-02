import crypto from 'crypto';

const TOKEN_SECRET = 'uwjs-coffee-shop-token-secret';

export function createToken(payload) {
	const body = JSON.stringify(payload);
	const bodyPart = Buffer.from(body).toString('base64url');
	const signature = crypto
		.createHmac('sha256', TOKEN_SECRET)
		.update(bodyPart)
		.digest('base64url');

	return `${bodyPart}.${signature}`;
}

export function verifyToken(token) {
	const [bodyPart, signature] = token.split('.');
	if (!bodyPart || !signature) {
		throw new Error('Invalid token format');
	}

	const expectedSignature = crypto
		.createHmac('sha256', TOKEN_SECRET)
		.update(bodyPart)
		.digest('base64url');

	if (expectedSignature !== signature) {
		throw new Error('Invalid token signature');
	}

	return JSON.parse(Buffer.from(bodyPart, 'base64url').toString('utf8'));
}