import mongoose from 'mongoose';


const serviceFieldSchema = new mongoose.Schema({
  fieldName: { type: String, required: true },       
  fieldType: { type: String, required: true },       
  options: [String],                                 
  required: { type: Boolean, default: true }     
}, { _id: false, timestamps: false });

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true
  },
  icon: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  serviceType:[serviceFieldSchema]

});

export default mongoose.model('Service', serviceSchema);
