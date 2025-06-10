import Service from '../models/service.model.js'; 

// Create a new service
export const createService = async (req, res, next) => {
  try {
    const { name, type, icon, serviceType } = req.body;
    const newService =await Service.create({ name, type, icon, serviceType });
    newService.save();
    res.status(201).json(newService);
  } catch (error) {
    next(error)
  }
};

// Get all services
export const getAllServices = async (req, res, next) => {
  try {
    const services = await Service.find();
    res.status(200).json(services);
  } catch (error) {
    next(error)
  }
};

// Get a single service by ID
export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.status(200).json(service);
  } catch (error) {
    next(error)
  }
};

// Update a service by ID
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedService = await Service.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updatedService) return res.status(404).json({ message: 'Service not found' });
    res.status(200).json({ message: 'Service updated successfully', data: updatedService });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update service', error: error.message });
  }
};

// Delete a service by ID
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedService = await Service.findByIdAndDelete(id);
    if (!deletedService) return res.status(404).json({ message: 'Service not found' });
    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    next(error)
  }
};
