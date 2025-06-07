import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import createError from 'http-errors';

export const createOrder = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const product = await Product.findById(productId);
    if (!product || product.status !== 'available') {
      throw createError(400, 'Product not available');
    }

    const order = await Order.create({
      buyerId: req.user._id,
      sellerId: product.sellerId,
      productId: product._id,
      amount: product.price
    });

    product.status = 'pending';
    await product.save();

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ buyerId: req.user._id }).populate('productId');
    res.json(orders);
  } catch (err) {
    next(err);
  }
};
