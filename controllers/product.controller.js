import Product from '../models/product.model.js';
import createError from 'http-errors';
import Service from '../models/service.model.js';

export const createProduct = async (req, res, next) => {
  try {
    const { title, service, serviceName, type, productRequiredFields, additionalFields, description, images } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    // Check if a product with the same title already exists for this seller
    const existingProduct = await Product.findOne({
      title,
      sellerId: req.user._id,
    });

    if (existingProduct) {
      return res.status(400).json({ success: false, message: 'Product with this title already exists' });
    }

    let serviceId = service;

    // If no service ID provided but serviceName is, and user is admin, create the service
    if (!serviceId && serviceName) {
      if (req.user.role !== 'seller') {
        return res.status(403).json({ success: false, message: 'Only admin can create a new service' });
      }

      const newService = await Service.create({
        name: serviceName,
        type: type || 'default', 
        icon: '',
      });

      serviceId = newService._id;
    }

    // Final validation
    if (!serviceId) {
      return res.status(400).json({ success: false, message: 'Service ID or serviceName is required' });
    }

    // Create new product
    const product = await Product.create({
      title,
      type,
      productRequiredFields,
      additionalFields,
      service: serviceId,
      description,
      images,
      sellerId: req.user._id,
    });

    return res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

export const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find().populate('service', 'username');
    res.json({success:true, data: products});
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

export const getProductsByServiceId = async (req, res, next) => {
  try {
    const { serviceId } = req.params;

    if (!serviceId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: "Invalid service ID" });
    }

    const products = await Product.find({ service: serviceId }).select('title _id');

    res.status(200).json({ success: true, data: products });
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
