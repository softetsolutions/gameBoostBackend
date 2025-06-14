import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  amount: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
  status: { type: String, enum: ['pending', 'paid', 'completed', 'cancelled'], default: 'pending' },
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
