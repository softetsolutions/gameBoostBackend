import Service from '../models/service.model.js'
/**
 * @desc Create a service with a single icon image (uploaded to Cloudinary)
 */
// Create a new service (for admin)
export const createService = async (req, res, next) => {
  try {
  const { name, icon } = req.body;
  const existingService = await Service.findOne({
   name,
   });
  if (existingService) {
  return res.status(400).json({ success: false, message: 'Service with this Name already exists' });
  }
   
    const iconUrl = req.file?.path;
    
    const service = new Service({ name,  icon:iconUrl });
    await service.save();

    res.status(200).json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
};

// Get all services
export const getAllServices = async (req, res, next) => {
  try {
    const services = await Service.find().select("name _id");
    res.json(services);
  } catch (err) {
    next(err);
  }
};

export const getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json(service);
  } catch (err) {
    next(err);
  }
};

// Update a service by ID
export const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;

     let updateData = { name: req.body.name };

    // Handle new icon upload via Cloudinary (if file uploaded)
    if (req.file) {
      updateData.icon = req.file.path;
    }

    const updated = await Service.findByIdAndUpdate(id, updateData, { new: true });

    if (!updated) {
      return res.status(404).json({ message: "Service not found" });
    }

  res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// Delete a service by ID
export const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await Service.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json({ message: "Service deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// admin can show or hide service on home page
export const toggleHomeVisibility = async (req, res, next) => {
  try {
    const { serviceId, show } = req.body;

    const updated = await Service.findByIdAndUpdate(
      serviceId,
      { showOnHome: !!show },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Visibility updated", data: updated });
  } catch (err) {
    next(err);
  }
};
