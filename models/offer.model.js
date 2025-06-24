import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  offerDetails: [Object],
  price: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  quantityAvailable: { type: Number, default: 1 },
  deliveryTime: { type: String, required: true },
  instantDelivery: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['active', 'inactive', 'soldout'],
    default: 'active',
  },
  images: [String],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Offer', offerSchema);
