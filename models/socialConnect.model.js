import mongoose from 'mongoose';

const SocialConnectSchema = new mongoose.Schema({

  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account', 
    required: true,
    unique: true 
  },
  facebook: {
    isLinked: {
      type: Boolean,
      default: false
    },
    facebookId: {
      type: String,
    }
  },
  google: {
    isLinked: {
      type: Boolean,
      default: false
    },
    googleId: {
      type: String,
    }
  },
  paypal: {
    isLinked: {
      type: Boolean,
      default: false
    },
    paypalId: {
      type: String,
    }
  },
  twitter: {
    isLinked: {
      type: Boolean,
      default: false
    },
    twitterId: {
      type: String,
    }
  }
}, {
  timestamps: true 
});


export default mongoose.model('SocialConnect', SocialConnectSchema);

