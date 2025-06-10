import Product from '../models/product.model.js';
import createError from 'http-errors';

export const createProduct = async (req, res, next) => {
  try {
    const { title } = req.body;

    // Check if product with same title exists for the same seller
    const existingProduct = await Product.findOne({
      title,
      sellerId: req.user._id,
    });

    if (existingProduct) {
      return res.status(400).json({ message: 'Product with this title already exists' });
    }
    // Create new product
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
