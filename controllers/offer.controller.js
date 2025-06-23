import Offer from '../models/offer.model.js';
import createError from 'http-errors';

// Create Offer
export const createOffer = async (req, res, next) => {
  try {
    const sellerId = req.user.id;
    const { product } = req.body;

    // Check for existing offer by the same seller for the same product
    const existingOffer = await Offer.findOne({ seller: sellerId, product });
    if (existingOffer) {
      return res.status(400).json({ success:false, message: 'Offer already exists for this product by this seller' });
    }
    // Create new offer
    const offer = await Offer.create({
      ...req.body,
      seller: req.user.id, 
    });

    res.status(200).json({success: true ,data: offer});
  } catch (err) {
    next(err);
  }
};

// Get All Offers 
export const getAllOffers = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status) {
      if (!['active', 'inactive', 'soldout'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status value' });
      }
      filter.status = status;
    }

    const offers = await Offer.find(filter).populate('product seller');
    res.json({ success: true, data: offers });
  } catch (err) {
    next(err);
  }
};


// Get Offer by ID
export const getOfferById = async (req, res, next) => {
  try {
    const offer = await Offer.findById(req.params.id).populate('product seller');
    if (!offer) return next(createError(404, 'Offer not found'));
    res.json({success: true, data: offer});
  } catch (err) {
    next(err);
  }
};

// Update Offer
export const updateOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findOneAndUpdate(
      { _id: req.params.id, seller: req.user.id },
      req.body,
      { new: true }
    );
    if (!offer) return next(createError(404, 'Offer not found or unauthorized'));
    res.json({ success: true, data: offer });
  } catch (err) {
    next(err);
  }
};

// Delete Offer
export const deleteOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findOneAndDelete({
      _id: req.params.id,
      seller: req.user.id,
    });
    if (!offer) return next(createError(404, 'Offer not found or unauthorized'));
    res.json({ success: true, message: 'Offer deleted successfully' });
  } catch (err) {
    next(err);
  }
};
