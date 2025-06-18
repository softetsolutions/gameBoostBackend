import Offer from '../models/offer.model.js';
import Product from '../models/product.model.js';
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

//get offer by service id
export const getOffersByService = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const { page, limit } = req.query;

    //  Find all product IDs under the given service ID
    const products = await Product.find({ service: serviceId }, '_id');
    const productIds = products.map(product => product._id);

    //  Build query to fetch offers with matching product IDs
    const query = { product: { $in: productIds } };

    //  Apply pagination if page/limit provided
    if (page && limit) {
      const pageNumber = parseInt(page) || 1;
      const pageSize = parseInt(limit) || 10;

      const offers = await Offer.find(query)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .populate('product', 'title') 
        .populate('seller', 'name email');

      const total = await Offer.countDocuments(query);

      return res.status(200).json({
        success: true,
        data: offers,
        pagination: {
          total,
          page: pageNumber,
          limit: pageSize,
          pages: Math.ceil(total / pageSize),
        },
      });
    }

    // If no pagination, return all offers
    const offers = await Offer.find(query)
      .populate('product', 'title')
      .populate('seller', 'name email');

    res.status(200).json({ success: true, data: offers });
  } catch (error) {
    next(error);
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
