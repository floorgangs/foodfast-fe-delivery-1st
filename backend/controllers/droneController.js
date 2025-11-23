import Drone from "../models/Drone.js";
import Restaurant from "../models/Restaurant.js";
import Order from "../models/Order.js";

// Get all drones
export const getAllDrones = async (req, res) => {
  try {
    const drones = await Drone.find().populate("restaurant", "name");
    res.json({
      success: true,
      count: drones.length,
      data: drones,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single drone
export const getDrone = async (req, res) => {
  try {
    const drone = await Drone.findById(req.params.id).populate(
      "restaurant",
      "name address phone"
    );

    if (!drone) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy drone",
      });
    }

    res.json({
      success: true,
      data: drone,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get drones by restaurant
export const getRestaurantDrones = async (req, res) => {
  try {
    const drones = await Drone.find({
      restaurant: req.params.restaurantId,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: drones.length,
      data: drones,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create new drone
export const createDrone = async (req, res) => {
  try {
    const droneData = {
      ...req.body,
      restaurant:
        req.user.role === "restaurant" ? req.user._id : req.body.restaurant,
    };

    const drone = await Drone.create(droneData);

    res.status(201).json({
      success: true,
      data: drone,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update drone
export const updateDrone = async (req, res) => {
  try {
    const drone = await Drone.findById(req.params.id);

    if (!drone) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy drone",
      });
    }

    const updatedDrone = await Drone.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedDrone,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update drone status
export const updateDroneStatus = async (req, res) => {
  try {
    const { status, batteryLevel } = req.body;
    const drone = await Drone.findById(req.params.id);

    if (!drone) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy drone",
      });
    }

    drone.status = status || drone.status;
    if (batteryLevel !== undefined) {
      drone.batteryLevel = batteryLevel;
    }

    await drone.save();

    // Emit socket event for real-time updates
    if (req.io) {
      req.io.emit("drone_status_updated", {
        droneId: drone._id,
        status: drone.status,
        batteryLevel: drone.batteryLevel,
      });
    }

    res.json({
      success: true,
      data: drone,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update drone location
export const updateDroneLocation = async (req, res) => {
  try {
    const { lat, lng, heading } = req.body;
    const drone = await Drone.findById(req.params.id);

    if (!drone) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy drone",
      });
    }

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Thiếu tọa độ hợp lệ cho drone',
      });
    }

    drone.currentLocation = { lat, lng };
    await drone.save();

    const activeOrder = await Order.findOne({
      $or: [
        { drone: drone._id },
        { assignedDrone: drone._id },
      ],
      status: { $in: ['confirmed', 'preparing', 'ready', 'delivering'] },
    });

    if (activeOrder) {
      activeOrder.droneDeliveryDetails = activeOrder.droneDeliveryDetails || {};
      activeOrder.droneDeliveryDetails.currentLocation = {
        lat,
        lng,
        heading,
        updatedAt: new Date(),
      };
      activeOrder.markModified('droneDeliveryDetails');
      await activeOrder.save();

      if (req.io && activeOrder.customer) {
        req.io.to(`customer_${activeOrder.customer}`).emit('order_tracking_updated', {
          orderId: activeOrder._id,
          droneLocation: activeOrder.droneDeliveryDetails.currentLocation,
        });
      }
    }

    // Emit socket event for real-time tracking
    if (req.io) {
      req.io.emit("drone_location_updated", {
        droneId: drone._id,
        location: drone.currentLocation,
      });
    }

    res.json({
      success: true,
      data: drone,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete drone
export const deleteDrone = async (req, res) => {
  try {
    const drone = await Drone.findById(req.params.id);

    if (!drone) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy drone",
      });
    }

    await drone.deleteOne();

    res.json({
      success: true,
      message: "Xóa drone thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
