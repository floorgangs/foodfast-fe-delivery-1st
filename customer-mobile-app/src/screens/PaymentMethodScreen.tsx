import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Platform,
  StatusBar,
} from 'react-native';

interface PaymentMethod {
  id: string;
  type: 'card' | 'momo' | 'zalopay';
  cardNumber?: string;
  cardHolder?: string;
  expiryDate?: string;
  phoneNumber?: string;
  isDefault: boolean;
}

const PaymentMethodScreen = ({ navigation }: any) => {
  const [methods, setMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      cardNumber: '**** **** **** 1234',
      cardHolder: 'NGUYEN VAN A',
      expiryDate: '12/25',
      isDefault: true,
    },
    {
      id: '2',
      type: 'momo',
      phoneNumber: '0901234567',
      isDefault: false,
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState<'card' | 'momo' | 'zalopay'>('card');
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
    phoneNumber: '',
  });

  const handleAdd = () => {
    setFormData({
      cardNumber: '',
      cardHolder: '',
      expiryDate: '',
      cvv: '',
      phoneNumber: '',
    });
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    const confirmDelete = Platform.OS === 'web'
      ? window.confirm('Bạn có chắc chắn muốn xóa phương thức thanh toán này?')
      : true;

    if (confirmDelete) {
      setMethods(methods.filter(method => method.id !== id));
      if (Platform.OS !== 'web') {
        const Alert = require('react-native').Alert;
        Alert.alert('Thành công', 'Đã xóa phương thức thanh toán');
      }
    }
  };

  const handleSave = () => {
    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: selectedType,
      isDefault: methods.length === 0,
      ...(selectedType === 'card' && {
        cardNumber: `**** **** **** ${formData.cardNumber.slice(-4)}`,
        cardHolder: formData.cardHolder.toUpperCase(),
        expiryDate: formData.expiryDate,
      }),
      ...(selectedType !== 'card' && {
        phoneNumber: formData.phoneNumber,
      }),
    };
    setMethods([...methods, newMethod]);
    setModalVisible(false);
  };

  const handleSetDefault = (id: string) => {
    setMethods(methods.map(method => ({
      ...method,
      isDefault: method.id === id,
    })));
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'card': return '💳';
      case 'momo': return '🅼';
      case 'zalopay': return '🇿';
      default: return '💳';
    }
  };

  const getMethodName = (type: string) => {
    switch (type) {
      case 'card': return 'Thẻ tín dụng/Ghi nợ';
      case 'momo': return 'Ví MoMo';
      case 'zalopay': return 'Ví ZaloPay';
      default: return 'Unknown';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Phương thức thanh toán</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Payment Methods List */}
        {methods.map((method) => (
          <View key={method.id} style={styles.methodCard}>
            <View style={styles.methodHeader}>
              <View style={styles.methodInfo}>
                <Text style={styles.methodIcon}>{getMethodIcon(method.type)}</Text>
                <View style={styles.methodDetails}>
                  <View style={styles.methodNameRow}>
                    <Text style={styles.methodName}>{getMethodName(method.type)}</Text>
                    {method.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Mặc định</Text>
                      </View>
                    )}
                  </View>
                  {method.type === 'card' && (
                    <>
                      <Text style={styles.methodText}>{method.cardNumber}</Text>
                      <Text style={styles.methodText}>{method.cardHolder}</Text>
                    </>
                  )}
                  {method.type !== 'card' && (
                    <Text style={styles.methodText}>{method.phoneNumber}</Text>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.methodActions}>
              {!method.isDefault && (
                <TouchableOpacity onPress={() => handleSetDefault(method.id)}>
                  <Text style={styles.setDefaultButton}>Đặt làm mặc định</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => handleDelete(method.id)}>
                <Text style={styles.deleteButton}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Add Button */}
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>+ Thêm phương thức mới</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thêm phương thức thanh toán</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              {/* Type Selection */}
              <View style={styles.typeSelection}>
                <TouchableOpacity
                  style={[styles.typeButton, selectedType === 'card' && styles.typeButtonActive]}
                  onPress={() => setSelectedType('card')}
                >
                  <Text style={[styles.typeButtonText, selectedType === 'card' && styles.typeButtonTextActive]}>
                    💳 Thẻ
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, selectedType === 'momo' && styles.typeButtonActive]}
                  onPress={() => setSelectedType('momo')}
                >
                  <Text style={[styles.typeButtonText, selectedType === 'momo' && styles.typeButtonTextActive]}>
                    🅼 MoMo
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, selectedType === 'zalopay' && styles.typeButtonActive]}
                  onPress={() => setSelectedType('zalopay')}
                >
                  <Text style={[styles.typeButtonText, selectedType === 'zalopay' && styles.typeButtonTextActive]}>
                    🇿 ZaloPay
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Card Form */}
              {selectedType === 'card' && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Số thẻ</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0000 0000 0000 0000"
                      value={formData.cardNumber}
                      onChangeText={(text) => setFormData({ ...formData, cardNumber: text })}
                      keyboardType="number-pad"
                      maxLength={16}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Tên chủ thẻ</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="NGUYEN VAN A"
                      value={formData.cardHolder}
                      onChangeText={(text) => setFormData({ ...formData, cardHolder: text })}
                      autoCapitalize="characters"
                    />
                  </View>

                  <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                      <Text style={styles.label}>Ngày hết hạn</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="MM/YY"
                        value={formData.expiryDate}
                        onChangeText={(text) => setFormData({ ...formData, expiryDate: text })}
                        maxLength={5}
                      />
                    </View>

                    <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                      <Text style={styles.label}>CVV</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="123"
                        value={formData.cvv}
                        onChangeText={(text) => setFormData({ ...formData, cvv: text })}
                        keyboardType="number-pad"
                        maxLength={3}
                        secureTextEntry
                      />
                    </View>
                  </View>
                </>
              )}

              {/* E-Wallet Form */}
              {selectedType !== 'card' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Số điện thoại</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập số điện thoại"
                    value={formData.phoneNumber}
                    onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                    keyboardType="phone-pad"
                  />
                </View>
              )}

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Lưu</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    fontSize: 16,
    color: '#EA5034',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  methodCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  methodHeader: {
    marginBottom: 12,
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  methodDetails: {
    flex: 1,
  },
  methodNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  methodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: '#EA5034',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  methodText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  methodActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  setDefaultButton: {
    fontSize: 14,
    color: '#EA5034',
    fontWeight: '500',
  },
  deleteButton: {
    fontSize: 14,
    color: '#999',
  },
  addButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EA5034',
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 16,
    color: '#EA5034',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalClose: {
    fontSize: 24,
    color: '#666',
  },
  modalForm: {
    padding: 16,
  },
  typeSelection: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  typeButtonActive: {
    borderColor: '#EA5034',
    backgroundColor: '#FFF5F3',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#EA5034',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
  },
  saveButton: {
    backgroundColor: '#EA5034',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PaymentMethodScreen;
