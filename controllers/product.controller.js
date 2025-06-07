import Product from '../models/product.model.js';
import createError from 'http-errors';

export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create({ ...req.body, sellerId: req.user._id });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

export const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find().populate('sellerId', 'username');
    res.json(products);
  } catch (err) {
    next(err);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) throw createError(404, 'Product not found');
    res.json(product);
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, sellerId: req.user._id },
      req.body,
      { new: true }
    );
    if (!product) throw createError(404, 'Not authorized or not found');
    res.json(product);
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, sellerId: req.user._id });
    if (!product) throw createError(404, 'Not authorized or not found');
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};
