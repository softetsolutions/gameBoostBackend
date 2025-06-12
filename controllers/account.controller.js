import Account from "../models/account.model.js";
import createError from 'http-errors';

export const createAccount = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      nationalIdentityNumber,
      gender,
      dateOfBirth,
      instantMessengers,
      billingAddress,
      taxRegistrationNumber,
    } = req.body;

    const newAccount = await Account.create({
      firstName,
      lastName,
      nationalIdentityNumber,
      gender,
      dateOfBirth,
      instantMessengers,
      billingAddress,
      taxRegistrationNumber,
    });
    res.status(201).json({success:true, newAccount});
  } catch (err) {
    next(err);
  }
};

export const getAccount = async (req, res, next) => {
  try {
    const accounts = await Account.find();
    if (accounts.length === 0) {
      return res.status(404).json({ message: "No accounts found" });
    }
    res.status(200).json(accounts);
  } catch (err) {
    next(err);
  }
};

export const getAccountById = async (req, res, next) => {
  try {
    const { _id } = req.params;
    const account = await Account.findById(_id);
    if (!account) throw createError(404, "Account not found");
    res.status(200).json(account);
  } catch (err) {
    next(err);
  }
};

export const updateAccount = async (req, res, next) => {
  try {
    const updatedAccount = await Account.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );
    if (!updatedAccount) throw createError(404, "Not authorized or not found");
    res.status(200).json(updatedAccount);
  } catch (err) {
    next(err);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const deletedAccount = await Account.findOneAndDelete({
      _id: req.params.id,
    });
    if (!deletedAccount) throw createError(404, "Not authorized or not found");
    res.status(200).json({ message: "Account deleted" });
  } catch (err) {
    next(err);
  }
};
