import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const droneSchema = new mongoose.Schema({
  droneId: String,
  name: String,
  model: String,
  restaurant: mongoose.Schema.Types.ObjectId,
  status: String,
  batteryLevel: Number,
  maxWeight: Number,
  maxDistance: Number,
  currentLocation: {
    lat: Number,
    lng: Number
  },
  homeLocation: {
    lat: Number,
    lng: Number
  },
  isActive: Boolean,
}, { timestamps: true });

const Drone = mongoose.model('Drone', droneSchema);

async function createTestDrone() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Lấy restaurant đầu tiên
    const Restaurant = mongoose.model('Restaurant', new mongoose.Schema({}, { strict: false }));
    const restaurant = await Restaurant.findOne({});
    
    if (!restaurant) {
      console.error('❌ No restaurant found! Please create a restaurant first.');
      process.exit(1);
      return;
    }

    console.log('📍 Using restaurant:', restaurant.name, restaurant._id);

    // Xóa drone cũ không hợp lệ
    const deletedCount = await Drone.deleteMany({ 
      $or: [
        { name: { $exists: false } },
        { restaurant: { $exists: false } },
        { droneId: { $exists: false } }
      ]
    });
    
    if (deletedCount.deletedCount > 0) {
      console.log(`🗑️ Deleted ${deletedCount.deletedCount} invalid drones`);
    }

    // Kiểm tra xem đã có drone hợp lệ chưa
    const existingDrone = await Drone.findOne({ 
      status: 'available',
      name: { $exists: true },
      restaurant: { $exists: true }
    });
    
    if (existingDrone) {
      console.log('✅ Drone available already exists:', existingDrone._id);
      console.log('Name:', existingDrone.name);
      console.log('Model:', existingDrone.model);
      console.log('Battery:', existingDrone.batteryLevel + '%');
      console.log('Restaurant:', existingDrone.restaurant);
      process.exit(0);
      return;
    }

    // Tạo drone mới
    const droneId = `DRONE-${Date.now().toString().slice(-8)}`;
    const drone = await Drone.create({
      droneId: droneId,
      name: `Drone ${droneId}`,
      model: 'DJI Mavic 3 Pro',
      restaurant: restaurant._id,
      status: 'available',
      batteryLevel: 100,
      maxWeight: 5000, // 5kg
      maxDistance: 30000, // 30km
      currentLocation: {
        lat: 10.762622,
        lng: 106.660172
      },
      homeLocation: {
        lat: 10.762622,
        lng: 106.660172
      },
      isActive: true,
    });

    console.log('✅ Test drone created successfully!');
    console.log('Drone ID:', drone._id);
    console.log('DroneId:', drone.droneId);
    console.log('Name:', drone.name);
    console.log('Model:', drone.model);
    console.log('Restaurant:', drone.restaurant);
    console.log('Status:', drone.status);
    console.log('Battery:', drone.batteryLevel + '%');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestDrone();
