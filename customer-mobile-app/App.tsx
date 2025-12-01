import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, View, TouchableOpacity, StyleSheet, Text, useWindowDimensions, PanResponder } from 'react-native';
import type { PanResponderGestureState } from 'react-native';
import { NavigationContainer, useNavigation, useNavigationState } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { store, RootState } from './src/store';
import { setUser } from './src/store/slices/authSlice';
import { fetchCart } from './src/store/slices/cartSlice';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import RestaurantDetailScreen from './src/screens/RestaurantDetailScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import OrderTrackingScreen from './src/screens/OrderTrackingScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import PersonalInfoScreen from './src/screens/PersonalInfoScreen';
import AddressScreen from './src/screens/AddressScreen';
import PaymentMethodScreen from './src/screens/PaymentMethodScreen';
import VouchersScreen from './src/screens/VouchersScreen';
import ThirdPartyPaymentScreen from './src/screens/ThirdPartyPaymentScreen';
import PayPalPaymentScreen from './src/screens/PayPalPaymentScreen';
import APIConfigScreen from './src/screens/APIConfigScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

class RootErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.log('[ErrorBoundary] message:', error?.message);
    console.log('[ErrorBoundary] componentStack:', errorInfo?.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>Đã xảy ra lỗi</Text>
          <Text style={{ textAlign: 'center', color: '#666' }}>{this.state.error.message}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const setupGlobalErrorLogging = () => {
  const globalErrorUtils = (global as any).ErrorUtils;

  if (globalErrorUtils?.setGlobalHandler) {
    const defaultHandler = globalErrorUtils.getGlobalHandler?.();
    globalErrorUtils.setGlobalHandler((error: any, isFatal?: boolean) => {
      const stack = error?.componentStack || error?.stack;
      console.log('[GlobalError]', error?.message, stack);
      if (typeof defaultHandler === 'function') {
        defaultHandler(error, isFatal);
      }
    });
  }
};

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#EA5034',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#eee',
          height: Platform.OS === 'ios' ? 85 : 75,
          paddingBottom: Platform.OS === 'ios' ? 25 : 18,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Trang chủ',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'Thông báo',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarLabel: 'Đơn hàng',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt" size={24} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Tài khoản',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const hiddenCartRoutes = new Set(['Cart', 'Checkout']);

const BUTTON_SIZE = 56;
const HORIZONTAL_MARGIN = 16;
const TOP_SAFE_MARGIN = 80;
const BOTTOM_SAFE_MARGIN = Platform.OS === 'ios' ? 180 : 140;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const deriveInitialPosition = (width: number, height: number) => {
  // Place button at bottom right corner by default
  const x = Math.max(HORIZONTAL_MARGIN, width - BUTTON_SIZE - HORIZONTAL_MARGIN);
  const y = Math.max(TOP_SAFE_MARGIN, height - BUTTON_SIZE - BOTTOM_SAFE_MARGIN);
  return { x, y };
};

function CartFloatingButton() {
  const navigation = useNavigation<any>();
  const items = useSelector((state: RootState) => state?.cart?.items || []);
  const routeName = useNavigationState((state: any) => {
    const currentRoute = state?.routes?.[state?.index];
    const nestedRoute = currentRoute?.state?.routes?.[currentRoute?.state?.index];
    return nestedRoute?.name ?? currentRoute?.name ?? '';
  });
  const { width, height } = useWindowDimensions();

  const [position, setPosition] = useState<{ x: number; y: number }>(() => deriveInitialPosition(width, height));
  const startOffset = useRef(position);
  const isDragging = useRef(false);

  const clampPosition = useCallback((x: number, y: number) => {
    const maxX = Math.max(HORIZONTAL_MARGIN, width - BUTTON_SIZE - HORIZONTAL_MARGIN);
    const maxY = Math.max(TOP_SAFE_MARGIN, height - BUTTON_SIZE - BOTTOM_SAFE_MARGIN);
    return {
      x: clamp(x, HORIZONTAL_MARGIN, maxX),
      y: clamp(y, TOP_SAFE_MARGIN, maxY),
    };
  }, [height, width]);

  useEffect(() => {
    setPosition(prev => {
      const next = clampPosition(prev.x, prev.y);
      if (next.x === prev.x && next.y === prev.y) {
        return prev;
      }
      return next;
    });
  }, [clampPosition]);

  const finishDrag = useCallback((gesture: PanResponderGestureState) => {
    if (!gesture) {
      return;
    }
    const next = clampPosition(
      startOffset.current.x + gesture.dx,
      startOffset.current.y + gesture.dy,
    );
    setPosition(prev => {
      if (prev.x === next.x && prev.y === next.y) {
        return prev;
      }
      return next;
    });
    startOffset.current = next;

    const movedDistance = Math.sqrt(gesture.dx * gesture.dx + gesture.dy * gesture.dy);
    if (!isDragging.current && movedDistance < 6) {
      navigation.navigate('Cart');
    }
    isDragging.current = false;
  }, [clampPosition, navigation]);

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, gesture) => (
      Math.abs(gesture.dx) > 4 || Math.abs(gesture.dy) > 4
    ),
    onPanResponderGrant: () => {
      startOffset.current = { x: position.x, y: position.y };
  isDragging.current = true;
    },
    onPanResponderMove: (_, gesture) => {
      const next = clampPosition(
        startOffset.current.x + gesture.dx,
        startOffset.current.y + gesture.dy,
      );

      if (!isDragging.current && (Math.abs(gesture.dx) > 4 || Math.abs(gesture.dy) > 4)) {
        isDragging.current = true;
      }

      setPosition(prev => {
        if (prev.x === next.x && prev.y === next.y) {
          return prev;
        }
        return next;
      });
    },
    onPanResponderRelease: (_, gesture) => finishDrag(gesture),
    onPanResponderTerminate: (_, gesture) => finishDrag(gesture),
  }), [clampPosition, finishDrag, position.x, position.y]);

  const totalItems = items.reduce((sum, item) => sum + (item?.quantity ?? 0), 0);

  if (totalItems === 0 || hiddenCartRoutes.has(routeName)) {
    return null;
  }

  return (
    <TouchableOpacity
      {...panResponder.panHandlers}
      style={[floatingStyles.cartButton, { left: position.x, top: position.y }]}
      activeOpacity={0.85}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      onPress={() => {
        if (!isDragging.current) {
          navigation.navigate('Cart');
        }
      }}
      accessibilityRole="button"
      accessibilityLabel="Mở giỏ hàng"
    >
      <Ionicons name="bag-handle-outline" size={24} color="#EA5034" />
      <View style={floatingStyles.cartBadge}>
        <Text style={floatingStyles.cartBadgeText}>
          {totalItems > 99 ? '99+' : String(totalItems)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function AppNavigator() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Load user from AsyncStorage
    const loadUser = async () => {
      try {
        const userJson = await AsyncStorage.getItem('user');
        const token = await AsyncStorage.getItem('token');
        
        if (userJson && token) {
          const user = JSON.parse(userJson);
          store.dispatch(setUser(user));
          
          // Chỉ load cart khi đã có user và token
          try {
            await store.dispatch(fetchCart()).unwrap();
          } catch (error: any) {
            // Chỉ log lỗi nếu không phải lỗi authentication
            if (error && !error.includes('Token không hợp lệ')) {
              console.error('Error fetching cart:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };

    loadUser();
  }, []);

  return (
    <NavigationContainer>
      <View style={{ flex: 1 }}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={HomeTabs} />
          <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} />
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="ThirdPartyPayment" component={ThirdPartyPaymentScreen} options={{ headerShown: false }} />
          <Stack.Screen name="PayPalPayment" component={PayPalPaymentScreen} options={{ headerShown: false }} />
          <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
          <Stack.Screen name="Address" component={AddressScreen} />
          <Stack.Screen name="PaymentMethod" component={PaymentMethodScreen} />
          <Stack.Screen name="Vouchers" component={VouchersScreen} />
          <Stack.Screen name="APIConfig" component={APIConfigScreen} options={{ headerShown: true, title: 'Cấu hình Server' }} />
        </Stack.Navigator>
        <CartFloatingButton />
      </View>
    </NavigationContainer>
  );
}

const floatingStyles = StyleSheet.create({
  cartButton: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderColor: '#F5C2B6',
    borderWidth: 1,
    borderRadius: 28,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EA5034',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 100,
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EA5034',
    borderRadius: 9,
    minWidth: 20,
    paddingHorizontal: 4,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});

export default function App() {
  React.useEffect(() => {
    setupGlobalErrorLogging();
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <RootErrorBoundary>
          <AppNavigator />
        </RootErrorBoundary>
      </SafeAreaProvider>
    </Provider>
  );
}
