import mongoose from 'mongoose';

const sellerRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  dob: { type: Date, required: true },
  Nationalidentitynumber: {type:String},
  Taxregistrationnumber: {type:String},
  Address: { type: String, required: true },
  City: { type: String, required: true },
  Postalcode: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });

export default mongoose.model('SellerRequest', sellerRequestSchema);
