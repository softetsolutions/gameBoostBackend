import User from '../models/user.model.js';
import createError from 'http-errors';

export const getAccountDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select(
      'firstName lastName displayName gender dob address city state zip country phone '
    );
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const updateAccountDetails = async (req, res, next) => {
  try {
    const { firstName, lastName,displayName, phone, gender, dob, address, city, state, zip } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { firstName, lastName, displayName, phone,gender, dob, address, city, state, zip  } },
      { new: true }
    ).select('firstName lastName phone gender dob address city state zip ');

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};




















