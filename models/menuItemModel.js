import mongoose from 'mongoose';

const MenuItemSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true,
		unique: true,
		index: true,
	},
	description: {
		type: String,
		default: '',
		trim: true,
	},
	price: {
		type: Number,
		required: true,
		min: 0,
	},
	category: {
		type: String,
		default: 'coffee',
		trim: true,
		index: true,
	},
	available: {
		type: Boolean,
		default: true,
	},
}, {
	timestamps: true,
});

MenuItemSchema.index({ name: 'text', description: 'text' });

const MenuItem = mongoose.model('MenuItem', MenuItemSchema);

export default MenuItem;