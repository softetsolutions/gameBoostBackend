import Offer from '../models/offer.model.js';
import Product from '../models/product.model.js';
import Order from '../models/order.model.js';
import Service from '../models/service.model.js';
import createError from 'http-errors';

// Create Offer
/**
 * @desc Create an offer with Cloudinary image upload
 */
export const createOffer = async (req, res, next) => {
  try {
    const sellerId = req.user.id;
     const {
      product,
      price,
      quantityAvailable,
      deliveryTime,
      currency = 'INR',
      offerDetails,
      status,
      instantDelivery = false,
    } = req.body;

    // Check for existing offer by the same seller for the same product
    const existingOffer = await Offer.findOne({ seller: sellerId, product });
    if (existingOffer) {
      return res.status(400).json({ success:false, message: 'Offer already exists for this product by this seller' });
    }
     
    const imageUrls = Array.isArray(req.files) ? req.files.map(file => file.path) : [];


    // Create new offer
    const offer = await Offer.create({
      product,
      price,
      quantityAvailable,
      deliveryTime,
      currency,
      offerDetails,
      instantDelivery,
      status,
      images: imageUrls,
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


// Get Offer by Id
export const getOfferById = async (req, res, next) => {
  try {
    const offer = await Offer.findById(req.params.id)
      .populate({
        path: 'product'
      })
      .populate({
        path: 'seller',
        select: '_id displayName'
      });

    if (!offer) return next(createError(404, 'Offer not found'));

    // Count completed orders for this seller
    const completedOrderCount = await Order.countDocuments({
      sellerId: offer.seller._id,
      status: 'completed'
    });

    res.status(200).json({
      success: true,
      data: {
        ...offer.toObject(),
        seller: {
          ...offer.seller.toObject(),
          completedOrderCount
        }
      }
    });
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
/**
 * @desc Update offer and upload new images to Cloudinary if provided
 */
export const updateOffer = async (req, res, next) => {
  try {
    // Find the offer
    const offer = await Offer.findOne({ _id: req.params.id, seller: req.user.id });

    if (!offer) {
      return next(createError(404, 'Offer not found or unauthorized'));
    }

    // Handle image uploads via Cloudinary
    if (req.files && req.files.length > 0) {
      const imageUrls = req.files.map(file => file.path);
      req.body.images = imageUrls;
    }

    // Update the offer
    const updated = await Offer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.status(200).json({ success: true, data: updated });
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

// get offers by seller
export const getOffersBySellerId = async (req, res, next) => {
  try {
    const { sellerId } = req.params;

    if (!sellerId) {
      throw createError(400, 'Seller ID is required');
    }

    const offers = await Offer.find({ seller: sellerId }).populate({
        path: 'product',
        populate: {
        path: 'service',
        select: 'name', 
        },
      });

    res.status(200).json({ success: true, data: offers });
  } catch (err) {
    next(err);
  }
};

// get offers by pruduct and service id 
export const getOffersByProductAndService = async (req, res, next) => {
  try {
    const { productId, serviceId } = req.query;

    if (!productId || !serviceId) {
      return next(createError(400, 'Both productId and serviceId are required'));
    }

    // Validate product under the service
    const product = await Product.findOne({ _id: productId, service: serviceId });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found under this service' });
    }

    // Get all offers for this product
    const offers = await Offer.find({ product: productId }).populate('product');
  
    //service details
     const servicesWithCounts = await Service.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'service',
          as: 'products',
        },
      },
      {
        $unwind: {
          path: '$products',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'offers',
          localField: 'products._id',
          foreignField: 'product',
          as: 'offers',
        },
      },
      {
        $group: {
          _id: {
            _id: '$_id',
            name: '$name',
            icon: '$icon',
          },
          offerCount: { $sum: { $size: '$offers' } },
        },
      },
      {
        $project: {
          _id: '$_id._id',
          name: '$_id.name',
          icon: '$_id.icon',
          offerCount: 1,
        },
      },
    ]);
 
    res.status(200).json({success: true, servicesWithCounts, offers,});
 
} catch (err) {
    next(err);
  }
};