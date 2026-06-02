import mongoose from 'mongoose';
import crypto from 'crypto';

const USER_SALT_LENGTH = 16;
const USER_KEY_LENGTH = 64;
const USER_ITERATIONS = 100000;
const USER_DIGEST = 'sha512';

const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
		index: true,
		lowercase: true,
		trim: true,
	},
	passwordHash: {
		type: String,
		required: true,
	},
	passwordSalt: {
		type: String,
		required: true,
	},
	role: {
		type: String,
		enum: ['user', 'admin'],
		default: 'user',
	},
}, {
	timestamps: true,
});

UserSchema.methods.setPassword = function setPassword(password) {
	this.passwordSalt = crypto.randomBytes(USER_SALT_LENGTH).toString('hex');
	this.passwordHash = crypto.pbkdf2Sync(
		password,
		this.passwordSalt,
		USER_ITERATIONS,
		USER_KEY_LENGTH,
		USER_DIGEST,
	).toString('hex');
};

UserSchema.methods.verifyPassword = function verifyPassword(password) {
	const hashed = crypto.pbkdf2Sync(
		password,
		this.passwordSalt,
		USER_ITERATIONS,
		USER_KEY_LENGTH,
		USER_DIGEST,
	).toString('hex');

	return hashed === this.passwordHash;
};

const User = mongoose.model('User', UserSchema);

export default User;