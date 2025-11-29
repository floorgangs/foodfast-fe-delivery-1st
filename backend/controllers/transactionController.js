import Transaction from '../models/Transaction.js';
import Restaurant from '../models/Restaurant.js';

// Get transactions for a restaurant
export const getRestaurantTransactions = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { limit = 20, page = 1, type } = req.query;
    
    const filter = { restaurant: restaurantId };
    if (type) filter.type = type;
    
    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('order', 'orderNumber totalAmount');
    
    const total = await Transaction.countDocuments(filter);
    
    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create income transaction (when order is completed)
export const createIncomeTransaction = async (req, res) => {
  try {
    const { restaurantId, orderId, amount, description } = req.body;
    
    // Get current balance
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhà hàng'
      });
    }
    
    const balanceBefore = restaurant.balance || 0;
    const balanceAfter = balanceBefore + amount;
    
    // Create transaction
    const transaction = await Transaction.create({
      restaurant: restaurantId,
      order: orderId,
      type: 'income',
      amount,
      description: description || 'Thu nhập từ đơn hàng',
      status: 'completed',
      balanceBefore,
      balanceAfter
    });
    
    // Update restaurant balance
    restaurant.balance = balanceAfter;
    await restaurant.save();
    
    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Request withdrawal
export const requestWithdraw = async (req, res) => {
  try {
    const { restaurantId, amount, paypalEmail } = req.body;
    
    // Validate
    if (!amount || amount < 100000) {
      return res.status(400).json({
        success: false,
        message: 'Số tiền rút tối thiểu là 100,000 VNĐ'
      });
    }
    
    if (!paypalEmail) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp email PayPal'
      });
    }
    
    // Get restaurant and check balance
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhà hàng'
      });
    }
    
    const currentBalance = restaurant.balance || 0;
    if (currentBalance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Số dư không đủ'
      });
    }
    
    const balanceAfter = currentBalance - amount;
    
    // Create pending withdrawal transaction
    const transaction = await Transaction.create({
      restaurant: restaurantId,
      type: 'withdraw',
      amount,
      description: `Rút tiền về PayPal: ${paypalEmail}`,
      status: 'pending',
      paypalEmail,
      balanceBefore: currentBalance,
      balanceAfter
    });
    
    // Deduct from balance immediately (pending withdrawal)
    restaurant.balance = balanceAfter;
    restaurant.paypalEmail = paypalEmail;
    await restaurant.save();
    
    res.status(201).json({
      success: true,
      data: transaction,
      message: 'Yêu cầu rút tiền đã được ghi nhận. Tiền sẽ được chuyển trong 1-3 ngày làm việc.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Admin: Get all pending withdrawals
export const getPendingWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Transaction.find({
      type: 'withdraw',
      status: 'pending'
    })
      .sort({ createdAt: -1 })
      .populate('restaurant', 'name phone email paypalEmail');
    
    res.json({
      success: true,
      data: withdrawals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Admin: Process withdrawal (mark as completed or failed)
export const processWithdrawal = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { status, paypalTransactionId, note } = req.body;
    
    if (!['completed', 'failed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ'
      });
    }
    
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giao dịch'
      });
    }
    
    if (transaction.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Giao dịch này đã được xử lý'
      });
    }
    
    // If failed, refund the balance
    if (status === 'failed') {
      const restaurant = await Restaurant.findById(transaction.restaurant);
      if (restaurant) {
        restaurant.balance = (restaurant.balance || 0) + transaction.amount;
        await restaurant.save();
      }
    }
    
    // Update transaction
    transaction.status = status;
    if (paypalTransactionId) transaction.paypalTransactionId = paypalTransactionId;
    if (note) transaction.description += ` | ${note}`;
    await transaction.save();
    
    res.json({
      success: true,
      data: transaction,
      message: status === 'completed' 
        ? 'Đã xử lý rút tiền thành công' 
        : 'Đã từ chối yêu cầu rút tiền'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all transactions (admin)
export const getAllTransactions = async (req, res) => {
  try {
    const { limit = 50, page = 1, type, status, restaurantId } = req.query;
    
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (restaurantId) filter.restaurant = restaurantId;
    
    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('restaurant', 'name')
      .populate('order', 'orderNumber');
    
    const total = await Transaction.countDocuments(filter);
    
    // Calculate summary
    const summary = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: transactions,
      summary,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
