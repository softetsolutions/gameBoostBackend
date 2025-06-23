import Order from '../models/order.model.js';
import Offer from '../models/offer.model.js';
import createError from 'http-errors';

export const createOrder = async (req, res, next) => {
  try {
    const { offerId, quantity = 1 } = req.body;

    if (!offerId) {
      throw createError(400, 'Offer ID is required');
    }

    const offer = await Offer.findById(offerId).populate('product');

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
      buyerId: req.user._id || req.user.id,
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

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ buyerId: req.user.id }).populate('productId');
    res.json(orders);
  } catch (err) {
    next(err);
  }
};
