import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    maxlength: 50,
  },
  lastName: {
    type: String,
    // required: true,
    maxlength: 50,
  },
  nationalIdentityNumber: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: {
      values: ['Male', 'Female', 'Other'],
    },
    required: true,
  },
  dateOfBirth: {
    type:Date,
    required:true,
  },
instantMessengers: [{
    type: {
      type: String,
      // required: true,
      enum: { 
        values: ["Whatsapp", "Telegram", "Wechat", "Others"],
        message: 'Invalid messenger type'
      }
    },
    value: {
      type: String,
      // required: true,
    }
  }],
  billingAddress: {
    addressLine1: {
      type: String,
      required: true,
    },
    addressLine2: {
      type: String // Optional
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true, 
    },
    zipCode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    }
  },
  taxRegistrationNumber: { 
    countryCode: {
      type: String,
      uppercase: true, 
    },
    number: {
      type: String,
      match: [/^[A-Za-z0-9]{10,20}$/, 'Invalid tax registration number format']
    }
  }
}, {
  timestamps: true 
});

export default mongoose.model('Account', accountSchema);
