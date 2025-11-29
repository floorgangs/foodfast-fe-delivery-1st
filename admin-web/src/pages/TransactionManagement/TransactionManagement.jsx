import { useState, useEffect } from 'react';
import axios from 'axios';
import './TransactionManagement.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function TransactionManagement() {
  const [transactions, setTransactions] = useState([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'all', 'income', 'withdraw'
  const [summary, setSummary] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (activeTab === 'pending') {
        const response = await axios.get(`${API_URL}/transactions/pending-withdrawals`, { headers });
        if (response.data.success) {
          setPendingWithdrawals(response.data.data);
        }
      } else {
        const typeParam = activeTab === 'all' ? '' : `&type=${activeTab}`;
        const response = await axios.get(`${API_URL}/transactions?limit=100${typeParam}`, { headers });
        if (response.data.success) {
          setTransactions(response.data.data);
          setSummary(response.data.summary || []);
        }
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessWithdrawal = async (transactionId, status) => {
    const action = status === 'completed' ? 'duyệt' : 'từ chối';
    if (!confirm(`Bạn có chắc muốn ${action} yêu cầu rút tiền này?`)) return;

    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/transactions/${transactionId}/process`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert(response.data.message);
        loadData();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      alert('Không thể xử lý yêu cầu');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const formatMoney = (amount) => {
    return amount?.toLocaleString('vi-VN') || '0';
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { text: 'Chờ xử lý', class: 'pending' },
      completed: { text: 'Hoàn thành', class: 'completed' },
      failed: { text: 'Thất bại', class: 'failed' },
      cancelled: { text: 'Đã hủy', class: 'cancelled' }
    };
    return statusMap[status] || { text: status, class: 'default' };
  };

  const getTypeBadge = (type) => {
    const typeMap = {
      income: { text: 'Thu nhập', class: 'income', icon: 'trending_up' },
      withdraw: { text: 'Rút tiền', class: 'withdraw', icon: 'payments' },
      refund: { text: 'Hoàn tiền', class: 'refund', icon: 'replay' },
      fee: { text: 'Phí dịch vụ', class: 'fee', icon: 'receipt' }
    };
    return typeMap[type] || { text: type, class: 'default', icon: 'help' };
  };

  // Calculate totals from summary
  const totalIncome = summary.find(s => s._id === 'income')?.total || 0;
  const totalWithdraw = summary.find(s => s._id === 'withdraw')?.total || 0;

  if (loading) {
    return (
      <div className="transaction-management">
        <div className="loading-state">
          <span className="material-icons spinning">sync</span>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-management">
      <div className="page-header">
        <div className="header-left">
          <h1>
            <span className="material-icons">account_balance_wallet</span>
            Quản lý Giao dịch
          </h1>
          <p className="subtitle">Quản lý thu nhập và yêu cầu rút tiền của nhà hàng</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card pending-card">
          <div className="stat-icon">
            <span className="material-icons">pending_actions</span>
          </div>
          <div className="stat-info">
            <span className="stat-value">{pendingWithdrawals.length || 0}</span>
            <span className="stat-label">Chờ xử lý</span>
          </div>
        </div>
        <div className="stat-card income-card">
          <div className="stat-icon">
            <span className="material-icons">trending_up</span>
          </div>
          <div className="stat-info">
            <span className="stat-value">{formatMoney(totalIncome)}đ</span>
            <span className="stat-label">Tổng thu nhập</span>
          </div>
        </div>
        <div className="stat-card withdraw-card">
          <div className="stat-icon">
            <span className="material-icons">payments</span>
          </div>
          <div className="stat-info">
            <span className="stat-value">{formatMoney(totalWithdraw)}đ</span>
            <span className="stat-label">Đã rút</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <span className="material-icons">pending_actions</span>
          Chờ duyệt ({pendingWithdrawals.length})
        </button>
        <button 
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <span className="material-icons">list</span>
          Tất cả
        </button>
        <button 
          className={`tab ${activeTab === 'income' ? 'active' : ''}`}
          onClick={() => setActiveTab('income')}
        >
          <span className="material-icons">trending_up</span>
          Thu nhập
        </button>
        <button 
          className={`tab ${activeTab === 'withdraw' ? 'active' : ''}`}
          onClick={() => setActiveTab('withdraw')}
        >
          <span className="material-icons">payments</span>
          Rút tiền
        </button>
      </div>

      {/* Pending Withdrawals */}
      {activeTab === 'pending' && (
        <div className="pending-section">
          {pendingWithdrawals.length === 0 ? (
            <div className="no-data">
              <span className="material-icons">check_circle</span>
              <p>Không có yêu cầu rút tiền nào đang chờ</p>
            </div>
          ) : (
            <div className="withdrawal-list">
              {pendingWithdrawals.map(tx => (
                <div key={tx._id} className="withdrawal-card">
                  <div className="withdrawal-header">
                    <div className="restaurant-info">
                      <h3>{tx.restaurant?.name || 'N/A'}</h3>
                      <span className="date">{formatDate(tx.createdAt)}</span>
                    </div>
                    <div className="amount">
                      {formatMoney(tx.amount)}đ
                    </div>
                  </div>
                  <div className="withdrawal-body">
                    <div className="info-row">
                      <span className="material-icons">email</span>
                      <span>PayPal: {tx.paypalEmail}</span>
                    </div>
                    <div className="info-row">
                      <span className="material-icons">phone</span>
                      <span>SĐT: {tx.restaurant?.phone || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="withdrawal-actions">
                    <button 
                      className="btn-approve"
                      onClick={() => handleProcessWithdrawal(tx._id, 'completed')}
                    >
                      <span className="material-icons">check</span>
                      Duyệt chuyển tiền
                    </button>
                    <button 
                      className="btn-reject"
                      onClick={() => handleProcessWithdrawal(tx._id, 'failed')}
                    >
                      <span className="material-icons">close</span>
                      Từ chối
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All Transactions */}
      {activeTab !== 'pending' && (
        <div className="transactions-table">
          <table>
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Nhà hàng</th>
                <th>Loại</th>
                <th>Số tiền</th>
                <th>Trạng thái</th>
                <th>Mô tả</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data-cell">
                    Chưa có giao dịch nào
                  </td>
                </tr>
              ) : (
                transactions.map(tx => {
                  const typeBadge = getTypeBadge(tx.type);
                  const statusBadge = getStatusBadge(tx.status);
                  return (
                    <tr key={tx._id}>
                      <td>{formatDate(tx.createdAt)}</td>
                      <td><strong>{tx.restaurant?.name || 'N/A'}</strong></td>
                      <td>
                        <span className={`type-badge ${typeBadge.class}`}>
                          <span className="material-icons">{typeBadge.icon}</span>
                          {typeBadge.text}
                        </span>
                      </td>
                      <td className={`amount ${tx.type}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatMoney(tx.amount)}đ
                      </td>
                      <td>
                        <span className={`status-badge ${statusBadge.class}`}>
                          {statusBadge.text}
                        </span>
                      </td>
                      <td className="description">{tx.description || '-'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TransactionManagement;
