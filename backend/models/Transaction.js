import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  type: {
    type: String,
    enum: ['income', 'withdraw', 'refund', 'fee'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'completed'
  },
  // For withdrawals
  paypalEmail: {
    type: String
  },
  paypalTransactionId: {
    type: String
  },
  // For tracking
  balanceBefore: {
    type: Number
  },
  balanceAfter: {
    type: Number
  }
}, {
  timestamps: true
});

// Indexes for faster queries
transactionSchema.index({ restaurant: 1, createdAt: -1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ status: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
