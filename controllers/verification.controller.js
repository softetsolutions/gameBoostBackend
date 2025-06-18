import UserVerificationStatus from "../models/verification.model.js";
import Account from "../models/account.model.js";

export const getUserVerificationStatus = async (req, res, next) => {
  try {
    const { accountId } = req.params;

    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: "Account not found." });
    }
    let userVerificationStatus = await UserVerificationStatus.findOne({ accountId });
    if (!userVerificationStatus) {
      userVerificationStatus = await UserVerificationStatus.create({ accountId });
    }
    res.status(200).json(userVerificationStatus);
  } catch (err) {
    next(err);
  }
};

export const updateUserVerificationStatus = async (req, res, next) => {
  try {
    const { accountId } = req.params;
    const updates = req.body;
    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: "Account not found." });
    }
    let userVerificationStatus = await UserVerificationStatus.findOne({ accountId });
    if (!userVerificationStatus) {
      userVerificationStatus = new UserVerificationStatus({ accountId });
    }
    const directVerificationFields = [
      'mobileNumberVerified',
      'nameVerified',
      'nationalIdentityNumberVerified',
      'billingAddressVerified',
      'dateOfBirthVerified'
    ];

    for (const key of directVerificationFields) {
      if (updates.hasOwnProperty(key)) {
        userVerificationStatus[key] = true;
      }
    }

    if (updates.eKYC && typeof updates.eKYC.isVerified === 'boolean') {
      userVerificationStatus.eKYC.isVerified = true;
    }

    const updated = await userVerificationStatus.save();

    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};
