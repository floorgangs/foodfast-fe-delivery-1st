import React, { useEffect, useMemo, useState } from 'react';
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
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { updateProfile } from '../store/slices/authSlice';
import {
  VIETNAM_LOCATIONS,
  getCityByCode,
  getDistrictByCode,
  getFullLocationName,
  City,
  District,
  Ward,
} from '../data/vietnamLocations';

interface AddressItem {
  id: string;
  mongoId?: string;
  label: string;
  contactName?: string;
  phone: string;
  address: string;
  city?: string;
  district?: string;
  ward?: string;
  coordinates?: {
    lat?: number;
    lng?: number;
  };
  isDefault: boolean;
}

const AddressScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [saving, setSaving] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressItem | null>(null);
  const [formData, setFormData] = useState({
    label: '',
    phone: '',
    streetAddress: '', // Changed from 'address' to 'streetAddress'
    cityCode: '',
    districtCode: '',
    wardCode: '',
  });
  const fallbackPhone = user?.phone ?? '';

  const mapAddressFromBackend = (entry: any, index: number): AddressItem => ({
    id: entry?._id || entry?.id || `addr-${index}-${Date.now()}`,
    mongoId: entry?._id,
    label: entry?.label || entry?.name || 'Địa chỉ',
    contactName: entry?.contactName || entry?.recipientName || entry?.label || '',
    phone: entry?.contactPhone || entry?.phone || fallbackPhone,
    address: entry?.address || entry?.fullAddress || '',
    city: entry?.city,
    district: entry?.district,
    ward: entry?.ward,
    coordinates: entry?.coordinates,
    isDefault: Boolean(entry?.isDefault),
  });

  useEffect(() => {
    const source = Array.isArray(user?.addresses) ? user?.addresses : [];
    const normalized = source.map((entry: any, index: number) =>
      mapAddressFromBackend(entry, index)
    );
    setAddresses(normalized);
  }, [user?.addresses, fallbackPhone]);

  const toBackendPayload = (entries: AddressItem[]) =>
    entries.map((item) => ({
      _id: item.mongoId,
      label: item.label,
      contactName: item.contactName ?? item.label,
      contactPhone: item.phone,
      address: item.address,
      city: item.city,
      district: item.district,
      ward: item.ward,
      coordinates: item.coordinates,
      isDefault: item.isDefault,
    }));

  const persistAddresses = async (next: AddressItem[]): Promise<boolean> => {
    const previous = addresses.map((addr) => ({ ...addr }));
    setAddresses(next);
    try {
      setSaving(true);
      await dispatch(updateProfile({ addresses: toBackendPayload(next) })).unwrap();
      return true;
    } catch (error: any) {
      const message = error?.message || 'Không thể lưu địa chỉ. Vui lòng thử lại.';
      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Không thành công', message);
      }
      const fallback = Array.isArray(user?.addresses)
        ? (user.addresses as any[]).map((entry, index) => mapAddressFromBackend(entry, index))
        : previous;
      setAddresses(fallback);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Get available districts based on selected city
  const availableDistricts = useMemo(() => {
    if (!formData.cityCode) return [];
    const city = getCityByCode(formData.cityCode);
    return city?.districts || [];
  }, [formData.cityCode]);

  // Get available wards based on selected city and district
  const availableWards = useMemo(() => {
    if (!formData.cityCode || !formData.districtCode) return [];
    const district = getDistrictByCode(formData.cityCode, formData.districtCode);
    return district?.wards || [];
  }, [formData.cityCode, formData.districtCode]);

  const handleAdd = () => {
    setEditingAddress(null);
    setFormData({
      label: '',
      phone: fallbackPhone,
      streetAddress: '',
      cityCode: '',
      districtCode: '',
      wardCode: '',
    });
    setModalVisible(true);
  };

  const handleEdit = (address: AddressItem) => {
    setEditingAddress(address);
    setFormData({
      label: address.label,
      phone: address.phone,
      streetAddress: address.address,
      cityCode: address.city || '',
      districtCode: address.district || '',
      wardCode: address.ward || '',
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    const confirmDelete =
      Platform.OS === 'web'
        ? window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')
        : true;

    if (!confirmDelete) {
      return;
    }

    const next = addresses
      .filter(addr => addr.id !== id)
      .map(addr => ({ ...addr }));

    if (next.length > 0 && !next.some(addr => addr.isDefault)) {
      next[0].isDefault = true;
    }

    const success = await persistAddresses(next);
    if (success && Platform.OS !== 'web') {
      Alert.alert('Thành công', 'Đã xóa địa chỉ');
    }
  };

  const handleSave = async () => {
    const trimmedLabel = formData.label.trim();
    const trimmedStreetAddress = formData.streetAddress.trim();
    const trimmedPhone = formData.phone.trim() || fallbackPhone;

    // Validate all required fields
    if (!trimmedLabel || !trimmedStreetAddress || !formData.cityCode || !formData.districtCode || !formData.wardCode) {
      const message = 'Vui lòng nhập đầy đủ thông tin địa chỉ (bao gồm tên đường, phường, quận, thành phố).';
      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Thiếu thông tin', message);
      }
      return;
    }

    // Construct full address with location hierarchy
    const locationName = getFullLocationName(formData.cityCode, formData.districtCode, formData.wardCode);
    const fullAddress = `${trimmedStreetAddress}, ${locationName}`;

    let next: AddressItem[];

    if (editingAddress) {
      next = addresses.map(addr => {
        if (addr.id !== editingAddress.id) {
          return { ...addr };
        }
        return {
          ...addr,
          label: trimmedLabel,
          contactName: addr.contactName || trimmedLabel,
          phone: trimmedPhone,
          address: fullAddress,
          city: formData.cityCode,
          district: formData.districtCode,
          ward: formData.wardCode,
        };
      });
    } else {
      const newAddress: AddressItem = {
        id: `addr-${Date.now()}`,
        label: trimmedLabel,
        contactName: trimmedLabel,
        phone: trimmedPhone,
        address: fullAddress,
        city: formData.cityCode,
        district: formData.districtCode,
        ward: formData.wardCode,
        isDefault: addresses.length === 0,
      };
      next = [...addresses.map(addr => ({ ...addr })), newAddress];
    }

    if (next.length > 0 && !next.some(addr => addr.isDefault)) {
      next[0].isDefault = true;
    }

    const success = await persistAddresses(next);
    if (success) {
      setModalVisible(false);
      setEditingAddress(null);
      setFormData({
        label: '',
        phone: fallbackPhone,
        streetAddress: '',
        cityCode: '',
        districtCode: '',
        wardCode: '',
      });
      if (Platform.OS !== 'web') {
        Alert.alert('Thành công', 'Đã lưu địa chỉ');
      }
    }
  };

  const handleSetDefault = async (id: string) => {
    const next = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id,
    }));

    const success = await persistAddresses(next);
    if (success && Platform.OS !== 'web') {
      Alert.alert('Thành công', 'Đã cập nhật địa chỉ mặc định');
    }
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
                <Text style={styles.addressName}>{address.label}</Text>
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
                  placeholder="Nhà riêng, Văn phòng"
                  value={formData.label}
                  onChangeText={(text) => setFormData({ ...formData, label: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Số điện thoại</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Số điện thoại"
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  keyboardType="phone-pad"
                />
              </View>

              {/* City Picker */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Thành phố <Text style={styles.required}>*</Text></Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.cityCode}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        cityCode: value,
                        districtCode: '', // Reset district when city changes
                        wardCode: '', // Reset ward when city changes
                      })
                    }
                    style={styles.picker}
                  >
                    <Picker.Item label="-- Chọn thành phố --" value="" />
                    {VIETNAM_LOCATIONS.map((city) => (
                      <Picker.Item key={city.code} label={city.name} value={city.code} />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* District Picker */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Quận/Huyện <Text style={styles.required}>*</Text></Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.districtCode}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        districtCode: value,
                        wardCode: '', // Reset ward when district changes
                      })
                    }
                    style={styles.picker}
                    enabled={!!formData.cityCode}
                  >
                    <Picker.Item label="-- Chọn quận/huyện --" value="" />
                    {availableDistricts.map((district) => (
                      <Picker.Item key={district.code} label={district.name} value={district.code} />
                    ))}
                  </Picker>
                </View>
                {!formData.cityCode && (
                  <Text style={styles.helperText}>Vui lòng chọn thành phố trước</Text>
                )}
              </View>

              {/* Ward Picker */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phường/Xã <Text style={styles.required}>*</Text></Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.wardCode}
                    onValueChange={(value) => setFormData({ ...formData, wardCode: value })}
                    style={styles.picker}
                    enabled={!!formData.districtCode}
                  >
                    <Picker.Item label="-- Chọn phường/xã --" value="" />
                    {availableWards.map((ward) => (
                      <Picker.Item key={ward.code} label={ward.name} value={ward.code} />
                    ))}
                  </Picker>
                </View>
                {!formData.districtCode && (
                  <Text style={styles.helperText}>Vui lòng chọn quận/huyện trước</Text>
                )}
              </View>

              {/* Street Address Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Số nhà, tên đường <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder=""
                  value={formData.streetAddress}
                  onChangeText={text => {
                    setFormData({ ...formData, streetAddress: text });
                  }}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                <Text style={styles.saveButtonText}>
                  {saving ? 'Đang lưu...' : 'Lưu'}
                </Text>
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
  required: {
    color: '#EA5034',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  picker: {
    height: 56,
    marginVertical: -4,
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
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
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddressScreen;
