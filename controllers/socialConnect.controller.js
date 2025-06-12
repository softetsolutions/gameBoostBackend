import SocialConnect from "../models/socialConnect.model.js";
import Account from "../models/account.model.js";

export const getSocialConnectStatus = async (req, res, next) => {
  try {
    const { accountId } = req.params;

    const account = await Account.findById(accountId);
    if (!account) return res.status(404).json({ message: "Account not found." });
    let socialConnect = await SocialConnect.findOne({ accountId });
    if (!socialConnect) {
      socialConnect = await SocialConnect.create({ accountId });
    }
    res.status(200).json(socialConnect);
  } catch (err) {
    next(err);
  }
};

export const linkSocialAccount = async (req, res, next) => {
  try {
    const { accountId } = req.params;
    const { platform, platformId } = req.body;
    const platformKey = platform?.toLowerCase();

    const account = await Account.findById(accountId);
    if (!account) return res.status(404).json({ message: "Account not found." });
    let socialConnect = await SocialConnect.findOne({ accountId });
    if (!socialConnect) socialConnect = new SocialConnect({ accountId });
    if (!['facebook', 'google', 'paypal', 'twitter'].includes(platformKey)) {
      return res.status(400).json({ message: `Unsupported platform: ${platform}` });
    }

    if (!socialConnect[platformKey]) {
        socialConnect[platformKey] = {};
    }
    socialConnect[platformKey].isLinked = true;
    socialConnect[platformKey][`${platformKey}Id`] = platformId;

    const updated = await socialConnect.save();
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

export const unlinkSocialAccount = async (req, res, next) => {
  try {
    const { accountId } = req.params;
    const { platform } = req.body;
    const platformKey = platform?.toLowerCase();

    const account = await Account.findById(accountId);
    if (!account) return res.status(404).json({ message: "Account not found." });

    const socialConnect = await SocialConnect.findOne({ accountId });
    if (!socialConnect) {
      return res.status(404).json({ message: "No social profile found." });
    }
    if (!['facebook', 'google', 'paypal', 'twitter'].includes(platformKey)) {
      return res.status(400).json({ message: `Unsupported platform: ${platform}` });
    }
    if (!socialConnect[platformKey]) {
        return res.status(400).json({ message: `Platform data not found for: ${platform}` });
    }
    socialConnect[platformKey].isLinked = false;
    socialConnect[platformKey][`${platformKey}Id`] = undefined; 

    const updated = await socialConnect.save();
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};
