import cron from 'node-cron';
import Order from '../models/Order.js';

// Auto-delete expired pending orders every 5 minutes
export const cleanupExpiredOrders = () => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const now = new Date();
      
      // Find orders that are:
      // 1. Still pending (not paid)
      // 2. Payment session expired (> 20 minutes old)
      const result = await Order.deleteMany({
        status: 'pending',
        paymentStatus: { $ne: 'paid' },
        paymentSessionExpiresAt: { $lt: now }
      });

      if (result.deletedCount > 0) {
        console.log(`🧹 Cleaned up ${result.deletedCount} expired pending orders`);
      }
    } catch (error) {
      console.error('❌ Error cleaning up expired orders:', error);
    }
  });

  console.log('✅ Order cleanup cron job started (runs every 5 minutes)');
};

// Also clean up very old pending orders (> 24 hours) regardless of expiry
export const cleanupOldPendingOrders = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const result = await Order.deleteMany({
        status: 'pending',
        paymentStatus: { $ne: 'paid' },
        createdAt: { $lt: yesterday }
      });

      if (result.deletedCount > 0) {
        console.log(`🧹 Cleaned up ${result.deletedCount} old pending orders (>24h)`);
      }
    } catch (error) {
      console.error('❌ Error cleaning up old pending orders:', error);
    }
  });

  console.log('✅ Old order cleanup cron job started (runs daily at midnight)');
};
