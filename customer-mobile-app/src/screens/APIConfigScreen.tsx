import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const API_URL_KEY = '@custom_api_url';

export const APIConfigScreen = ({ onSave }: { onSave?: () => void }) => {
  const [customURL, setCustomURL] = useState('');
  const [currentURL, setCurrentURL] = useState('');

  React.useEffect(() => {
    loadCurrentURL();
  }, []);

  const loadCurrentURL = async () => {
    try {
      const saved = await AsyncStorage.getItem(API_URL_KEY);
      if (saved) {
        setCurrentURL(saved);
        setCustomURL(saved);
      }
    } catch (error) {
      console.error('Error loading URL:', error);
    }
  };

  const handleSave = async () => {
    if (!customURL.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập URL');
      return;
    }

    // Validate URL
    if (!customURL.startsWith('http://') && !customURL.startsWith('https://')) {
      Alert.alert('Lỗi', 'URL phải bắt đầu với http:// hoặc https://');
      return;
    }

    try {
      await AsyncStorage.setItem(API_URL_KEY, customURL.trim());
      Alert.alert(
        'Thành công',
        'Đã lưu URL mới. Vui lòng thoát và mở lại app để áp dụng.',
        [
          {
            text: 'OK',
            onPress: () => {
              setCurrentURL(customURL.trim());
              onSave?.();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu URL');
    }
  };

  const handleReset = async () => {
    Alert.alert(
      'Xác nhận',
      'Xóa URL tùy chỉnh và dùng mặc định?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(API_URL_KEY);
              setCustomURL('');
              setCurrentURL('');
              Alert.alert('Đã xóa', 'Đã xóa URL tùy chỉnh. Restart app để dùng URL mặc định.');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa URL');
            }
          },
        },
      ]
    );
  };

  const examples = [
    { label: 'Ngrok', value: 'https://abc123.ngrok.io' },
    { label: 'LAN IP', value: 'http://192.168.1.163:5000' },
    { label: 'Localhost (Android)', value: 'http://10.0.2.2:5000' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="settings" size={32} color="#EA5034" />
        <Text style={styles.title}>Cấu hình Server</Text>
      </View>

      {currentURL ? (
        <View style={styles.currentBox}>
          <Text style={styles.currentLabel}>URL hiện tại:</Text>
          <Text style={styles.currentURL}>{currentURL}/api</Text>
        </View>
      ) : null}

      <View style={styles.inputSection}>
        <Text style={styles.label}>URL Server mới:</Text>
        <TextInput
          style={styles.input}
          value={customURL}
          onChangeText={setCustomURL}
          placeholder="https://your-ngrok-url.ngrok.io"
          placeholderTextColor="#999"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={styles.hint}>
          ⚠️ Không cần thêm /api ở cuối
        </Text>
      </View>

      <View style={styles.examplesSection}>
        <Text style={styles.examplesTitle}>Ví dụ:</Text>
        {examples.map((example, index) => (
          <TouchableOpacity
            key={index}
            style={styles.exampleItem}
            onPress={() => setCustomURL(example.value)}
          >
            <Text style={styles.exampleLabel}>{example.label}:</Text>
            <Text style={styles.exampleValue}>{example.value}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color="#2196F3" />
        <Text style={styles.infoText}>
          Để dùng Ngrok:{'\n'}
          1. Chạy: ngrok http 5000{'\n'}
          2. Copy URL từ terminal{'\n'}
          3. Paste vào ô trên{'\n'}
          4. Nhấn "Lưu URL"
        </Text>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.saveButtonText}>Lưu URL</Text>
        </TouchableOpacity>

        {currentURL ? (
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Ionicons name="trash" size={20} color="#fff" />
            <Text style={styles.resetButtonText}>Xóa URL</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  currentBox: {
    backgroundColor: '#e8f5e9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  currentLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  currentURL: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '500',
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#333',
  },
  hint: {
    fontSize: 12,
    color: '#f57c00',
    marginTop: 4,
  },
  examplesSection: {
    marginBottom: 24,
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  exampleItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  exampleLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  exampleValue: {
    fontSize: 13,
    color: '#2196F3',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1976d2',
    marginLeft: 12,
    lineHeight: 20,
  },
  buttons: {
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#EA5034',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#f44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default APIConfigScreen;
