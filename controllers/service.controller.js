import Service from "../models/service.model.js";

// Create a new service (for admin)
export const createService = async (req, res, next) => {
  try {
    const { name, icon } = req.body;

    const service = new Service({ name, icon });
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

    const updated = await Service.findByIdAndUpdate(
      id,
      { name: req.body.name, icon: req.body.icon },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json(updated);
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
