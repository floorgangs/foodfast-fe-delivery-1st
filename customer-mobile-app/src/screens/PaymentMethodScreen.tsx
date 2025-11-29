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
  Image,
} from 'react-native';

interface PaymentMethod {
  id: string;
  type: 'paypal';
  email?: string;
  isDefault: boolean;
}

const PaymentMethodScreen = ({ navigation }: any) => {
  const [methods, setMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'paypal',
      email: 'user@example.com',
      isDefault: true,
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
  });

  const handleAdd = () => {
    setFormData({
      email: '',
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
        Alert.alert('Thành công', 'Đã xóa tài khoản PayPal');
      }
    }
  };

  const handleSave = () => {
    if (!formData.email.trim()) {
      const Alert = require('react-native').Alert;
      Alert.alert('Lỗi', 'Vui lòng nhập email PayPal');
      return;
    }

    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: 'paypal',
      email: formData.email,
      isDefault: methods.length === 0,
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
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Hiện tại chỉ hỗ trợ thanh toán qua PayPal để đảm bảo giao hàng nhanh bằng drone
          </Text>
        </View>

        {/* Payment Methods List */}
        {methods.map((method) => (
          <View key={method.id} style={styles.methodCard}>
            <View style={styles.methodHeader}>
              <View style={styles.methodInfo}>
                <Image 
                  source={{ uri: 'https://www.paypalobjects.com/webstatic/icon/pp258.png' }}
                  style={styles.paypalLogo}
                  resizeMode="contain"
                />
                <View style={styles.methodDetails}>
                  <View style={styles.methodNameRow}>
                    <Text style={styles.methodName}>PayPal</Text>
                    {method.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Mặc định</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.methodText}>{method.email}</Text>
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
          <Text style={styles.addButtonText}>+ Thêm tài khoản PayPal</Text>
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
              <Text style={styles.modalTitle}>Thêm tài khoản PayPal</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              {/* PayPal Logo */}
              <View style={styles.paypalLogoContainer}>
                <Image 
                  source={{ uri: 'https://www.paypalobjects.com/webstatic/icon/pp258.png' }}
                  style={styles.paypalLogoLarge}
                  resizeMode="contain"
                />
                <Text style={styles.paypalTitle}>PayPal</Text>
              </View>

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email PayPal</Text>
                <TextInput
                  style={styles.input}
                  placeholder="your-email@example.com"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ email: text })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Text style={styles.helperText}>
                  Nhập địa chỉ email đã đăng ký với tài khoản PayPal của bạn
                </Text>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoBoxIcon}>💡</Text>
                <Text style={styles.infoBoxText}>
                  Bạn sẽ được chuyển đến trang PayPal để đăng nhập và xác nhận thanh toán khi đặt hàng
                </Text>
              </View>

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
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#E5F2FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0070BA',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#003087',
    lineHeight: 18,
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
  paypalLogo: {
    width: 50,
    height: 50,
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
    borderColor: '#0070BA',
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 16,
    color: '#0070BA',
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
  paypalLogoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  paypalLogoLarge: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  paypalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003087',
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
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF9E5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  infoBoxIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  saveButton: {
    backgroundColor: '#0070BA',
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
