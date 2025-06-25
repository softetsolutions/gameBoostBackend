import mongoose from 'mongoose';

const productRequiredFieldSchema = new mongoose.Schema({
  fieldName: { type: String, required: true },
  fieldType: { type: String, required: true }, 
  options: [String], 
  isrequired: { type: Boolean, default: true },
},{ _id: false, timestamps: false }); 

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: {
    type: String,
    required: true,
  },
  productRequiredFields: [productRequiredFieldSchema],
  additionalFields: [productRequiredFieldSchema],
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
  },
  description: String,
  images: [String],
}, { timestamps: true });

export default mongoose.model('Product', productSchema);