import Delivery from "../models/Delivery.js";
import Order from "../models/Order.js";
import Drone from "../models/Drone.js";

// Get available drones for a delivery
export const getAvailableDrones = async (req, res) => {
  try {
    const { restaurantId, distance, weight } = req.query;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: "Restaurant ID is required",
      });
    }

    // Find drones that meet criteria
    const drones = await Drone.find({
      restaurant: restaurantId,
      status: "available",
      batteryLevel: { $gte: 30 }, // At least 30% battery
    });

    // Filter by range and weight if provided
    let availableDrones = drones.filter((drone) => {
      const meetsRange = distance
        ? drone.maxRange >= parseFloat(distance)
        : true;
      const meetsWeight = weight ? drone.maxWeight >= parseFloat(weight) : true;
      return meetsRange && meetsWeight;
    });

    // Sort by battery level (highest first)
    availableDrones.sort((a, b) => b.batteryLevel - a.batteryLevel);

    res.json({
      success: true,
      data: availableDrones,
    });
  } catch (error) {
    console.error("Get available drones error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Assign drone to order
export const assignDroneToOrder = async (req, res) => {
  try {
    const { orderId, droneId } = req.body;

    if (!orderId || !droneId) {
      return res.status(400).json({
        success: false,
        message: "Order ID and Drone ID are required",
      });
    }

    // Find order
    const order = await Order.findById(orderId)
      .populate("restaurant", "name address phone")
      .populate("customer", "name phone");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order is ready for delivery
    if (order.status !== "ready") {
      return res.status(400).json({
        success: false,
        message: "Order is not ready for delivery",
      });
    }

    // Find drone
    const drone = await Drone.findById(droneId);

    if (!drone) {
      return res.status(404).json({
        success: false,
        message: "Drone not found",
      });
    }

    // Check if drone is available
    if (drone.status !== "available") {
      return res.status(400).json({
        success: false,
        message: "Drone is not available",
      });
    }

    // Create delivery
    const delivery = await Delivery.create({
      order: orderId,
      drone: droneId,
      restaurant: order.restaurant._id,
      pickupLocation: {
        address: order.restaurant.address,
        coordinates: order.restaurant.location?.coordinates || [0, 0],
      },
      deliveryLocation: {
        address: order.deliveryAddress.address,
        coordinates: order.deliveryAddress.coordinates || [0, 0],
      },
      status: "assigned",
      estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    });

    // Update order status
    order.status = "delivering";
    order.delivery = delivery._id;
    order.timeline.push({
      status: "delivering",
      note: `Drone ${drone.model} đã được giao nhiệm vụ giao hàng`,
      timestamp: new Date(),
    });
    await order.save();

    // Update drone status
    drone.status = "busy";
    drone.currentDelivery = delivery._id;
    await drone.save();

    // Populate delivery
    const populatedDelivery = await Delivery.findById(delivery._id)
      .populate("drone", "model serialNumber batteryLevel")
      .populate("order", "orderNumber total");

    res.json({
      success: true,
      data: populatedDelivery,
      message: "Drone assigned successfully",
    });
  } catch (error) {
    console.error("Assign drone error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Start delivery (pickup)
export const startDelivery = async (req, res) => {
  try {
    const { deliveryId } = req.params;

    const delivery = await Delivery.findById(deliveryId);

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found",
      });
    }

    if (delivery.status !== "assigned") {
      return res.status(400).json({
        success: false,
        message: "Delivery already started",
      });
    }

    delivery.status = "picked_up";
    delivery.pickupTime = new Date();
    await delivery.save();

    // Update order
    await Order.findByIdAndUpdate(delivery.order, {
      status: "delivering",
      $push: {
        timeline: {
          status: "picked_up",
          note: "Drone đã lấy hàng và đang giao",
          timestamp: new Date(),
        },
      },
    });

    res.json({
      success: true,
      data: delivery,
    });
  } catch (error) {
    console.error("Start delivery error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Complete delivery
export const completeDelivery = async (req, res) => {
  try {
    const { deliveryId } = req.params;

    const delivery = await Delivery.findById(deliveryId)
      .populate("drone")
      .populate("order");

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found",
      });
    }

    delivery.status = "delivered";
    delivery.deliveryTime = new Date();
    await delivery.save();

    // Update order
    const order = await Order.findById(delivery.order);
    order.status = "delivered";
    order.timeline.push({
      status: "delivered",
      note: "Đơn hàng đã được giao thành công",
      timestamp: new Date(),
    });
    await order.save();

    // Update drone
    await Drone.findByIdAndUpdate(delivery.drone._id, {
      status: "available",
      currentDelivery: null,
      $inc: { totalDeliveries: 1 },
    });

    res.json({
      success: true,
      data: delivery,
    });
  } catch (error) {
    console.error("Complete delivery error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get delivery tracking info
export const getDeliveryTracking = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order || !order.delivery) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found",
      });
    }

    const delivery = await Delivery.findById(order.delivery)
      .populate("drone", "model serialNumber batteryLevel currentLocation")
      .populate("order", "orderNumber total deliveryAddress");

    res.json({
      success: true,
      data: delivery,
    });
  } catch (error) {
    console.error("Get delivery tracking error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update drone location (for real-time tracking)
export const updateDroneLocation = async (req, res) => {
  try {
    const { droneId } = req.params;
    const { latitude, longitude, altitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    const drone = await Drone.findByIdAndUpdate(
      droneId,
      {
        currentLocation: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        lastLocationUpdate: new Date(),
      },
      { new: true }
    );

    if (!drone) {
      return res.status(404).json({
        success: false,
        message: "Drone not found",
      });
    }

    // Save location history to Locations collection
    const Location = (await import("../models/Location.js")).default;
    await Location.create({
      locationId: `${droneId}-${Date.now()}`,
      droneId: droneId,
      longitude,
      latitude,
      altitude: altitude || 0,
      recordedAt: new Date(),
    });

    console.log('✅ Location saved for drone:', droneId);

    // Emit socket event for real-time tracking
    if (req.app.get("io")) {
      req.app.get("io").emit("drone_location_update", {
        droneId: drone._id,
        location: { latitude, longitude, altitude },
        deliveryId: drone.currentDelivery,
      });
    }

    res.json({
      success: true,
      data: drone,
    });
  } catch (error) {
    console.error("Update drone location error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get drone location history
export const getDroneLocationHistory = async (req, res) => {
  try {
    const { droneId } = req.params;
    const { limit = 100, startDate, endDate } = req.query;

    const Location = (await import("../models/Location.js")).default;
    
    const query = { droneId };
    
    // Filter by date range if provided
    if (startDate || endDate) {
      query.recordedAt = {};
      if (startDate) query.recordedAt.$gte = new Date(startDate);
      if (endDate) query.recordedAt.$lte = new Date(endDate);
    }

    const locations = await Location.find(query)
      .sort({ recordedAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: locations,
      count: locations.length,
    });
  } catch (error) {
    console.error("Get drone location history error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
