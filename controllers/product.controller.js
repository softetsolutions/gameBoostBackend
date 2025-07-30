import Product from '../models/product.model.js';
import createError from 'http-errors';
import Service from '../models/service.model.js';
import Offer from '../models/offer.model.js';

/**
 * @desc Create a product with Cloudinary image upload
 */
export const createProduct = async (req, res, next) => {
  try {
    let { title, service, serviceName, type, productRequiredFields, additionalFields, description, images } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    // Check if a product with the same title already exists for this seller
    const existingProduct = await Product.findOne({
      title,
      serviceId: service,
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

   const imageUrls = Array.isArray(req.files) ? req.files.map(file => file.path) : [];

 
  //parse productRequiredFields 
    if (typeof productRequiredFields === 'string') {
      try {
        productRequiredFields = JSON.parse(productRequiredFields);
      } catch {
        return res.status(400).json({ success: false, message: 'Invalid productRequiredFields format' });
      }
    }
    const product = await Product.create({
      title,
      type,
      productRequiredFields,
      additionalFields,
      service: serviceId,
      description,
      images:imageUrls,
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
    res.json({success: true, data: product});
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
/**
 * @desc Update product and upload new images to Cloudinary if provided
 */
export const updateProduct = async (req, res, next) => {
   try {
    // Find the product by ID and seller
    const product = await Product.findOne({
      _id: req.params.id,
      sellerId: req.user._id,
    });

    if (!product) {
      throw createError(404, 'Not authorized or product not found');
    }

    // Handle Cloudinary images (if new images uploaded)
    if (req.files && req.files.length > 0) {
      const imageUrls = req.files.map((file) => file.path);
      req.body.images = imageUrls; // overwrite existing or update
    }
    // Parse productRequiredFields if it's a string
    if (req.body.productRequiredFields && typeof req.body.productRequiredFields === 'string') {
      try {
        req.body.productRequiredFields = JSON.parse(req.body.productRequiredFields);
      } catch {
        return res.status(400).json({ success: false, message: 'Invalid productRequiredFields format' });
      }
    }

    // Update the product with new data
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.status(200).json({ success: true, data: updated });
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
