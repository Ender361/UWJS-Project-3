import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
	menuItemId: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'MenuItem',
	},
	name: {
		type: String,
		required: true,
		trim: true,
	},
	price: {
		type: Number,
		required: true,
		min: 0,
	},
	quantity: {
		type: Number,
		required: true,
		min: 1,
		default: 1,
	},
}, { _id: false });

const OrderSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'User',
		index: true,
	},
	items: {
		type: [OrderItemSchema],
		required: true,
		validate: {
			validator(value) {
				return Array.isArray(value) && value.length > 0;
			},
			message: 'At least one order item is required',
		},
	},
	status: {
		type: String,
		enum: ['pending', 'preparing', 'completed', 'cancelled'],
		default: 'pending',
		index: true,
	},
	notes: {
		type: String,
		default: '',
		trim: true,
	},
}, {
	timestamps: true,
});

OrderSchema.index({ createdAt: -1 });

const Order = mongoose.model('Order', OrderSchema);

export default Order;