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
      buyerId: req.user.id,
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
      .populate('sellerId productId')
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

export const getOrdersByBuyerId = async (req, res, next) => {
  try {
    const buyerId = req.user._id || req.user.id;
    const { status } = req.query;

    const query = { buyerId };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('productId')
      .populate('sellerId', 'username email');

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (err) {
    next(createError(500, 'Failed to fetch orders'));
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate('productId')
      .populate('sellerId', 'username email')
      .populate('buyerId', 'username email');

    if (!order) {
      return next(createError(404, 'Order not found'));
    }

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    next(createError(500, 'Failed to fetch order'));
  }
};

export const deleteOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return next(createError(404, 'Order not found'));
    }

    // Only buyer can delete
    if (req.user.id !== order.buyerId.toString()) {
      return next(createError(403, 'Unauthorized to delete this order'));
    }

    await Order.findByIdAndDelete(orderId);
    res.status(200).json({ success: true, message: 'Order deleted successfully' });
  } catch (err) {
    next(err);
  }
};

export const getOrdersBySellerId = async (req, res, next) => {
  try {
    const sellerId = req.user._id || req.user.id;
    const { status } = req.query;

    const query = { sellerId };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('productId')
      .populate('buyerId', 'username email');

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (err) {
    next(createError(500, 'Failed to fetch orders'));
  }
};

export const updateOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const updates = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return next(createError(404, 'Order not found'));
    }
  
    if (!order.buyerId || !req.user || !req.user.id) {
      return next(createError(403, 'Unauthorized or missing user ID'));
    }
    //  only buyer can update order details
    if (req.user.id !== order.buyerId.toString()) {
      return next(createError(403, 'Unauthorized to update this order'));
    }

    Object.assign(order, updates);
    await order.save();

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

export const getOrderCountByStatus = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    const count = await Order.countDocuments(query);
    res.status(200).json({ success: true, data: count  });
  } catch (err) {
    next(createError(500, 'Failed to fetch order count'));
  }
};






















