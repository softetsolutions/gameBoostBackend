import User from '../models/user.model.js';

export const getSocialConnectStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('socialAccounts');
    const social = user.socialAccounts?.toObject?.() || {};

    const status = {
      facebook: !!social.facebook,
      google: !!social.google,
      paypal: !!social.paypal,
      twitter: !!social.twitter
    };

    res.status(200).json({ success: true, data: status });
  } catch (err) {
    next(err);
  }
};

export const unlinkSocialAccount = async (req, res, next) => {
  try {
    const { platform } = req.body;

    if (!['facebook', 'google', 'paypal', 'twitter'].includes(platform)) {
      return res.status(400).json({ success: false, message: 'Invalid platform' });
    }

    const update = {};
    update[`socialAccounts.${platform}`] = '';

    await User.findByIdAndUpdate(req.user.id, { $set: update });

    res.status(200).json({ success: true, message: `${platform} unlinked successfully` });
  } catch (err) {
    next(err);
  }
};

