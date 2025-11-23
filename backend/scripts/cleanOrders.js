import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../config/database.js';
import Order from '../models/Order.js';
import Notification from '../models/Notification.js';

dotenv.config();

const cleanDatabase = async () => {
  try {
    await connectDB();

    console.log('🧹 Cleaning database...');

    // Delete all orders
    const ordersDeleted = await Order.deleteMany({});
    console.log(`✅ Deleted ${ordersDeleted.deletedCount} orders`);

    // Delete all notifications
    const notificationsDeleted = await Notification.deleteMany({});
    console.log(`✅ Deleted ${notificationsDeleted.deletedCount} notifications`);

    console.log('✨ Database cleaned successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    process.exit(1);
  }
};

cleanDatabase();
