import User from  '../models/user.model.js';
import bcrypt from 'bcrypt';


export const toggleTwoFactor = async (req, res, next) => {
  try {
    const { enabled } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { twoFactorEnabled: !!enabled } },
      { new: true }
    ).select('twoFactorEnabled');

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Incorrect old password' });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};