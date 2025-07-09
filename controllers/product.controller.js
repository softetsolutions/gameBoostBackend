import Product from '../models/product.model.js';
import createError from 'http-errors';
import Service from '../models/service.model.js';
import Offer from '../models/offer.model.js';

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
      if (req.user.role !== 'admin') {
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
    const products = await Product.find().populate('service', 'name');
    res.json({success:true, data: products});
  } catch (err) {
    next(err);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('service', 'name');
    if (!product) throw createError(404, 'Product not found');
    res.json(product);
  } catch (err) {
    next(err);
  }
};

//get product title and id by service id
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

// get homepage data
export const getHomePageData = async (req, res, next) => {
  try {
    const services = await Service.find({ showOnHome: true });

    const serviceData = await Promise.all(
      services.map(async (service) => {
        const products = await Product.aggregate([
          { $match: { service: service._id } },
          { $limit: 8 },
          {
            $lookup: {
              from: 'offers',
              localField: '_id',
              foreignField: 'product',
              as: 'offers',
            },
          },
          {
            $addFields: {
              offerCount: { $size: '$offers' },
            },
          },
          {
            $project: {
              title: 1,
              images: 1,
              offerCount: 1,
            },
          },
        ]);

        return {
          _id: service._id,
          name: service.name,
          icon: service.icon,
          products,
        };
      })
    );

    res.status(200).json({ success: true, data: serviceData });
  } catch (err) {
    next(err);
  }
};

export const getProductAndServiceDetailBySearchString = async (req, res) => {
  const { searchString } = req.params;

  try {
    const products = await Product.find({
      title: { $regex: searchString, $options: 'i' }
    })
      .populate('service')
      .lean(); // Return plain JS objects for performance

    const groupedProducts = {};

    products.forEach(product => {
      const title = product.title;

      const serviceObject = product.service
        ? { id: product.service._id.toString(), servicename: product.service.name }
        : null;

      if (!groupedProducts[title]) {
        groupedProducts[title] = {
          productName: title,
          services: [],
          serviceIds: new Set(), // To avoid duplicate services
        };
      }

      if (
        serviceObject &&
        !groupedProducts[title].serviceIds.has(serviceObject.id)
      ) {
        groupedProducts[title].services.push({
          id: serviceObject.id,
          servicename: serviceObject.servicename
        });
        groupedProducts[title].serviceIds.add(serviceObject.id);
      }
    });

    //Clean up (remove serviceIds Set before sending)
    const result = Object.values(groupedProducts).map(group => ({
      productName: group.productName,
      services: group.services
    }));

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};