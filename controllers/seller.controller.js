import SellerRequest from '../models/seller.model.js';
import User from '../models/user.model.js';
import createError from 'http-errors';

export const createSellerRequest = async (req, res, next) => {
  try {
    const { dob,Nationalidentitynumber, Taxregistrationnumber,Address,City,Postalcode } = req.body;
    const existing = await SellerRequest.findOne({ user: req.user.id });
    if (existing) return next(createError(409, 'You already submitted a request.'));

    const request = await SellerRequest.create({
      user: req.user.id,
      dob,
      Nationalidentitynumber, 
      Taxregistrationnumber,
      Address,
      City,
      Postalcode
    });

    res.status(201).json({ success: true, message: 'Request submitted', data: request });
  } catch (err) {
    next(err);
  }
};

export const getAllSellerRequests = async (req, res, next) => {
  try {
    const requests = await SellerRequest.find().populate('user', 'email firstName lastName');
    res.status(200).json({ success: true, data: requests });
  } catch (err) {
    next(err);
  }
};



export const approveSellerRequest = async (req, res, next) => {
  try {
    const request = await SellerRequest.findById(req.params.id);
    if (!request) return next(createError(404, 'Request not found'));

    request.status = 'approved';
    await request.save();

    await User.findByIdAndUpdate(request.user, { role: 'seller' });

    res.json({ success: true, message: 'Seller approved' });
  } catch (err) {
    next(err);
  }
};

export const rejectSellerRequest = async (req, res, next) => {
  try {
    const request = await SellerRequest.findById(req.params.id);
    if (!request) return next(createError(404, 'Request not found'));

    request.status = 'rejected';
    await request.save();

    res.json({ success: true, message: 'Seller request rejected' });
  } catch (err) {
    next(err);
  }
};

