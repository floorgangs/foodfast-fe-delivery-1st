import express from 'express';
import {
  getRestaurantTransactions,
  createIncomeTransaction,
  requestWithdraw,
  getPendingWithdrawals,
  processWithdrawal,
  getAllTransactions
} from '../controllers/transactionController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Restaurant routes
router.get('/restaurant/:restaurantId', protect, getRestaurantTransactions);
router.post('/income', protect, createIncomeTransaction);
router.post('/withdraw', protect, requestWithdraw);

// Admin routes
router.get('/', protect, admin, getAllTransactions);
router.get('/pending-withdrawals', protect, admin, getPendingWithdrawals);
router.put('/:transactionId/process', protect, admin, processWithdrawal);

export default router;
