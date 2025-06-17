import mongoose from "mongoose";

const credentialSchema = new mongoose.Schema({
  offerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Offer",
    required: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },
  label: {
    type: String,
    required: true,
    trim: true,
  },
  value: {
    type: String, // Encrypted
    required: true,
  },
  isDelivered: {
    type: Boolean,
    default: false,
  },
  isDeletedFromSellerView: {
    type: Boolean,
    default: false, // Set true after sale
  },
});

export default mongoose.model("credential", credentialSchema);
