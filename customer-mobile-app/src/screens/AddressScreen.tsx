import React, { useMemo, useState } from 'react';
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

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  isDefault: boolean;
}

const ADDRESS_SUGGESTIONS = [
  {
    id: 'vincom-dongkhoi',
    label: 'Vincom Đồng Khởi',
    address: '72 Lê Thánh Tôn, Bến Nghé, Quận 1, TP.HCM',
  },
  {
    id: 'landmark81',
    label: 'Landmark 81',
    address: '720A Điện Biên Phủ, Phường 22, Bình Thạnh, TP.HCM',
  },
  {
    id: 'saigoncentre',
    label: 'Saigon Centre',
    address: '65 Lê Lợi, Bến Nghé, Quận 1, TP.HCM',
  },
  {
    id: 'cresentmall',
    label: 'Crescent Mall',
    address: '101 Tôn Dật Tiên, Tân Phú, Quận 7, TP.HCM',
  },
  {
    id: 'citiho',
    label: 'Chung cư CitiHome',
    address: 'Cát Lái, Thành phố Thủ Đức, TP.HCM',
  },
  {
    id: 'vinhomegrandpark',
    label: 'Vinhomes Grand Park',
    address: 'Nguyễn Xiển, Long Thạnh Mỹ, TP.Thủ Đức, TP.HCM',
  },
];

const QUICK_ADDRESS_TAGS = ['Nhà riêng', 'Văn phòng', 'Chung cư', 'Sảnh bảo vệ'];

const AddressScreen = ({ navigation }: any) => {
  const [addresses, setAddresses] = useState<Address[]>([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = useMemo(() => {
    const keyword = formData.address.trim().toLowerCase();

    if (!keyword) {
      return ADDRESS_SUGGESTIONS.slice(0, 5);
    }

    return ADDRESS_SUGGESTIONS.filter(item =>
      `${item.label} ${item.address}`.toLowerCase().includes(keyword),
    ).slice(0, 6);
  }, [formData.address]);

  const handleAdd = () => {
    setEditingAddress(null);
    setFormData({ name: '', phone: '', address: '' });
    setShowSuggestions(false);
    setModalVisible(true);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      name: address.name,
      phone: address.phone,
      address: address.address,
    });
    setShowSuggestions(false);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    const confirmDelete = Platform.OS === 'web' 
      ? window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')
      : true;

    if (confirmDelete) {
      setAddresses(addresses.filter(addr => addr.id !== id));
      if (Platform.OS !== 'web') {
        const Alert = require('react-native').Alert;
        Alert.alert('Thành công', 'Đã xóa địa chỉ');
      }
    }
  };

  const handleSelectSuggestion = (suggestion: typeof ADDRESS_SUGGESTIONS[number]) => {
    setFormData(prev => ({
      ...prev,
      address: `${suggestion.label}, ${suggestion.address}`,
      name: prev.name || suggestion.label,
    }));
    setShowSuggestions(false);
  };

  const handleSave = () => {
    if (editingAddress) {
      // Update existing address
      setAddresses(addresses.map(addr => 
        addr.id === editingAddress.id 
          ? { ...addr, ...formData }
          : addr
      ));
    } else {
      // Add new address
      const newAddress: Address = {
        id: Date.now().toString(),
        ...formData,
        isDefault: addresses.length === 0,
      };
      setAddresses([...addresses, newAddress]);
    }
    setModalVisible(false);
    setShowSuggestions(false);
  };

  const handleSetDefault = (id: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id,
    })));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Địa chỉ giao hàng</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Address List */}
        {addresses.map((address) => (
          <View key={address.id} style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <View style={styles.addressNameRow}>
                <Text style={styles.addressName}>{address.name}</Text>
                {address.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Mặc định</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity onPress={() => handleEdit(address)}>
                <Text style={styles.editButton}>Sửa</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.addressPhone}>{address.phone}</Text>
            <Text style={styles.addressText}>{address.address}</Text>

            <View style={styles.addressActions}>
              {!address.isDefault && (
                <TouchableOpacity onPress={() => handleSetDefault(address.id)}>
                  <Text style={styles.setDefaultButton}>Đặt làm mặc định</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => handleDelete(address.id)}>
                <Text style={styles.deleteButton}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Add Button */}
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>+ Thêm địa chỉ mới</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setModalVisible(false);
          setShowSuggestions(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingAddress ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm} keyboardShouldPersistTaps="handled">
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tên địa chỉ</Text>
                <TextInput
                  style={styles.input}
                  placeholder="VD: Nhà riêng, Văn phòng"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Số điện thoại</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập số điện thoại"
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Địa chỉ chi tiết</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Số nhà, tên đường, phường, quận, thành phố"
                  value={formData.address}
                  onChangeText={text => {
                    setFormData({ ...formData, address: text });
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  multiline
                  numberOfLines={4}
                />
                <View style={styles.quickTagRow}>
                  {QUICK_ADDRESS_TAGS.map(tag => (
                    <TouchableOpacity
                      key={tag}
                      style={styles.quickTag}
                      onPress={() => {
                        setFormData(prev => ({
                          ...prev,
                          address: prev.address ? `${tag} • ${prev.address}` : tag,
                        }));
                        setShowSuggestions(true);
                      }}
                    >
                      <Text style={styles.quickTagText}>{tag}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {showSuggestions && (
                  <View style={styles.suggestionList}>
                    {filteredSuggestions.length > 0 ? (
                      filteredSuggestions.map((item, index) => (
                        <TouchableOpacity
                          key={item.id}
                          style={[
                            styles.suggestionItem,
                            index === filteredSuggestions.length - 1 && styles.suggestionItemLast,
                          ]}
                          onPress={() => handleSelectSuggestion(item)}
                        >
                          <Text style={styles.suggestionTitle}>{item.label}</Text>
                          <Text style={styles.suggestionSubtitle}>{item.address}</Text>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <Text style={styles.noSuggestionText}>Không tìm thấy địa chỉ phù hợp, hãy nhập chi tiết hơn.</Text>
                    )}
                    <TouchableOpacity
                      style={styles.hideSuggestionButton}
                      onPress={() => setShowSuggestions(false)}
                    >
                      <Text style={styles.hideSuggestionText}>Ẩn gợi ý</Text>
                    </TouchableOpacity>
                  </View>
                )}
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
  addressCard: {
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
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressName: {
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
  editButton: {
    fontSize: 14,
    color: '#EA5034',
    fontWeight: '500',
  },
  addressPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  addressActions: {
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  quickTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  quickTag: {
    backgroundColor: '#FFF2EC',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  quickTagText: {
    color: '#EA5034',
    fontSize: 13,
    fontWeight: '600',
  },
  suggestionList: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  suggestionItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  suggestionItemLast: {
    borderBottomWidth: 0,
  },
  suggestionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  suggestionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  noSuggestionText: {
    paddingHorizontal: 14,
    paddingVertical: 16,
    fontSize: 13,
    color: '#6B7280',
  },
  hideSuggestionButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  hideSuggestionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EA5034',
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

export default AddressScreen;
