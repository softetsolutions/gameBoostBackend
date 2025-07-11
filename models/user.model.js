import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: {
      type: String,
      required: function () {
        return this.socialAccounts ? false : true;
      },
    },

  role: { type: String, enum: ['user', 'seller'], default: 'user' },
  walletBalance: { type: Number, default: 0 },
  // Personal Information
  firstName: { type: String },
  lastName:  { type: String },
  gender:    { type: String, enum: ['female','male'] },
  dob:       { type: Date },
  address:   { type: String },
  city:      { type: String },
  state:     { type: String },
  zip:       { type: String },
  country:   { type: String },
  phone:     { type: String },
  
  //computed display name
 
  displayName: { type: String, default: function() {return `${this.firstName || ''} ${this.lastName || ''}`.trim(); } },
 
  // social connect
  socialAccounts: {
  facebook: { type: String, default: '' },
  google:   { type: String, default: '' },
  paypal:   { type: String, default: '' },
  twitter:  { type: String, default: '' }
},
  // Verification and Security
  Tax: { type: String, default: '' },
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  twoFactorEnabled: { type: Boolean, default: false }
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
