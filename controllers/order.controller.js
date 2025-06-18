import Order from '../models/order.model.js';
import Offer from '../models/offer.model.js';
import createError from 'http-errors';

export const createOrder = async (req, res, next) => {
  try {
    const { offerId, quantity = 1 } = req.body;

    if (!offerId) {
      throw createError(400, 'Offer ID is required');
    }

    const offer = await Offer.findById(offerId).populate('product').populate('seller');
    
    if (!offer) {
      throw createError(404, 'Offer not found');
    }

    if (offer.status !== 'active') {
      throw createError(400, 'Offer is not available');
    }

    if (quantity > offer.quantityAvailable) {
      throw createError(400, `Only ${offer.quantityAvailable} units available`);
    }
    
    
    const amount = offer.price * quantity;
    

    const order = await Order.create({
      userId: req.user.id,
      sellerId: offer.seller._id,
      productId: offer.product._id,
      amount,
      quantity,
     
    });

    // Update offer quantity
    offer.quantityAvailable -= quantity;

    // If no stock left mark as soldout
    if (offer.quantityAvailable <= 0) {
      offer.status = 'soldout';
    }

    await offer.save();

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const { page, limit, status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const currentPage = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 0;

    const totalOrders = await Order.countDocuments(filter);

    let query = Order.find(filter)
      .populate('userId sellerId productId')
      .sort({ createdAt: -1 });

    if (pageSize > 0) {
      const skip = (currentPage - 1) * pageSize;
      query = query.skip(skip).limit(pageSize);
    }

    const orders = await query;

    res.status(200).json({
      success: true,
      currentPage,
      totalOrders,
      totalPages: pageSize > 0 ? Math.ceil(totalOrders / pageSize) : 1,
      data: orders,
    });
  } catch (err) {
    next(err);
  }
};
