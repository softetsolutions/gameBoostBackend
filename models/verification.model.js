import mongoose from 'mongoose';

const UserVerificationStatusSchema = new mongoose.Schema({
 
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
    unique: true
  },
  mobileNumberVerified: {
    type: Boolean,
    default: false,
  },
  nameVerified: {
    type: Boolean,
    default: false,
  },
  nationalIdentityNumberVerified: {
    type: Boolean,
    default: false,
  },
  billingAddressVerified: {
    type: Boolean,
    default: false,
  },
  dateOfBirthVerified: {
    type: Boolean,
    default: false,
  },
  eKYC: {
    isVerified: {
      type: Boolean,
      default: false,
    },
  }
}, {
  timestamps: true 
});

const UserVerificationStatus = mongoose.model('UserVerificationStatus', UserVerificationStatusSchema);
export default UserVerificationStatus;
