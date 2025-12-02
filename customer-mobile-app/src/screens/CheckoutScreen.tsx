import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  StatusBar,
  ActivityIndicator,
  Image,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import type { AppDispatch } from "../store";
import { orderAPI, voucherAPI } from "../services/api";
import { PAYMENT_METHODS, DEFAULT_ADDRESS } from "../constants";

const CheckoutScreen = ({ navigation }: any) => {
  const { items, total, currentRestaurantId } = useSelector(
    (state: RootState) => state.cart
  );
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const dispatch = useDispatch<AppDispatch>();

  // Success Modal State
  const [loading, setLoading] = useState(false);
  const [applyingVoucher, setApplyingVoucher] = useState(false);

  // Addresses - từ user profile hoặc default
  const [addresses, setAddresses] = useState(() => {
    if (user?.addresses && user.addresses.length > 0) {
      return user.addresses;
    }
    // Default address nếu user chưa có
    return [
      {
        id: "temp1",
        name: "Nhà riêng",
        address: "123 Đường ABC, Phường XYZ, Quận 1, TP.HCM",
        phone: user?.phone || "0901234567",
      },
    ];
  });

  const paymentMethods = PAYMENT_METHODS;

  const [selectedAddress, setSelectedAddress] = useState(
    addresses[0]?._id || addresses[0]?.id || ""
  );
  const [selectedPayment, setSelectedPayment] = useState("paypal");
  const [note, setNote] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [guestInfo, setGuestInfo] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    address: user?.addresses?.[0]?.address || "",
  });

  const deliveryFee = 15000; // Fixed drone delivery fee
  const finalTotal = total + deliveryFee - discount;

  // Update addresses when user changes (e.g., after adding new address)
  useEffect(() => {
    if (user?.addresses && user.addresses.length > 0) {
      setAddresses(user.addresses);
      // If no address is selected or selected address doesn't exist, select the first one
      const addressId = user.addresses[0]._id || user.addresses[0].id;
      if (
        !selectedAddress ||
        !user.addresses.find((a) => (a._id || a.id) === selectedAddress)
      ) {
        setSelectedAddress(addressId);
      }
    }
  }, [user?.addresses]);

  const handleGuestInfoChange = (
    field: keyof typeof guestInfo,
    value: string
  ) => {
    setGuestInfo((prev) => ({ ...prev, [field]: value }));
  };

  // Animation for success modal

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập mã voucher");
      return;
    }

    try {
      setApplyingVoucher(true);
      const response = await voucherAPI.apply(
        voucherCode.toUpperCase(),
        total + deliveryFee,
        currentRestaurantId
      );

      setDiscount(response.data.discount);
      Alert.alert(
        "Thành công",
        `Giảm giá ${response.data.discount.toLocaleString()}đ!`
      );
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Mã voucher không hợp lệ");
      setDiscount(0);
    } finally {
      setApplyingVoucher(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedPayment) {
      Alert.alert("Thông báo", "Vui lòng chọn phương thức thanh toán");
      return;
    }

    if (!isAuthenticated) {
      if (
        !guestInfo.name.trim() ||
        !guestInfo.phone.trim() ||
        !guestInfo.email.trim()
      ) {
        Alert.alert(
          "Thông báo",
          "Vui lòng nhập đầy đủ họ tên, số điện thoại và email."
        );
        return;
      }
      if (!guestInfo.address.trim()) {
        Alert.alert("Thông báo", "Vui lòng nhập địa chỉ để drone giao hàng.");
        return;
      }
    }

    // For authenticated users, validate address exists
    const selectedAddressData = isAuthenticated
      ? addresses.find((a) => (a._id || a.id) === selectedAddress)
      : null;
    if (isAuthenticated && !selectedAddressData) {
      Alert.alert("Thông báo", "Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    const selectedPaymentData = paymentMethods.find(
      (p) => p.id === selectedPayment
    );

    try {
      setLoading(true);

      const normalizeCoordinate = (value: any) => {
        if (typeof value === "number") {
          return value;
        }
        if (typeof value === "string" && value.trim() !== "") {
          const parsed = Number(value);
          return Number.isFinite(parsed) ? parsed : undefined;
        }
        return undefined;
      };

      const parseAddressComponents = (fullAddress: string) => {
        const normalized = fullAddress
          .toLowerCase()
          .replace(/\s+/g, " ")
          .trim();

        const districtPatterns = [
          {
            pattern:
              /quận\s*(\d+|[\w\sàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]+)/i,
            prefix: "Quận",
          },
          {
            pattern:
              /huyện\s*([\w\sàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]+)/i,
            prefix: "Huyện",
          },
          {
            pattern:
              /thành phố\s*([\w\sàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]+)/i,
            prefix: "Thành phố",
          },
        ];

        const wardPatterns = [
          {
            pattern:
              /phường\s*(\d+|[\w\sàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]+)/i,
            prefix: "Phường",
          },
          {
            pattern:
              /xã\s*([\w\sàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]+)/i,
            prefix: "Xã",
          },
          {
            pattern:
              /thị trấn\s*([\w\sàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]+)/i,
            prefix: "Thị trấn",
          },
        ];

        let district = "";
        let ward = "";
        let city = "";

        for (const { pattern, prefix } of districtPatterns) {
          const match = normalized.match(pattern);
          if (match) {
            const value = match[1].trim();
            district = `${prefix} ${
              value.charAt(0).toUpperCase() + value.slice(1)
            }`;
            break;
          }
        }

        for (const { pattern, prefix } of wardPatterns) {
          const match = normalized.match(pattern);
          if (match) {
            const value = match[1].trim();
            ward = `${prefix} ${
              value.charAt(0).toUpperCase() + value.slice(1)
            }`;
            break;
          }
        }

        if (
          /tp\.?\s*hồ chí minh|tp\.?\s*hcm|hồ chí minh|sài gòn|saigon/i.test(
            normalized
          )
        ) {
          city = "Hồ Chí Minh";
        } else if (/hà nội|hanoi/i.test(normalized)) {
          city = "Hà Nội";
        } else if (/đà nẵng|da nang/i.test(normalized)) {
          city = "Đà Nẵng";
        } else if (/cần thơ|can tho/i.test(normalized)) {
          city = "Cần Thơ";
        } else if (/hải phòng|hai phong/i.test(normalized)) {
          city = "Hải Phòng";
        }

        return { ward, district, city: city || "Hồ Chí Minh" };
      };

      const normalizedCoordinates = selectedAddressData?.coordinates
        ? {
            lat: normalizeCoordinate(selectedAddressData.coordinates.lat),
            lng: normalizeCoordinate(selectedAddressData.coordinates.lng),
          }
        : undefined;

      const fullAddressString = selectedAddressData?.address || "";
      const parsedComponents = parseAddressComponents(fullAddressString);

      const deliveryAddressPayload = isAuthenticated
        ? {
            street:
              selectedAddressData?.street || selectedAddressData?.address || "",
            address: fullAddressString,
            city: selectedAddressData?.city || parsedComponents.city,
            district:
              selectedAddressData?.district || parsedComponents.district,
            ward: selectedAddressData?.ward || parsedComponents.ward,
            phone: selectedAddressData?.phone || user?.phone || "",
            label: selectedAddressData?.label,
            coordinates:
              normalizedCoordinates?.lat != null &&
              normalizedCoordinates?.lng != null
                ? normalizedCoordinates
                : undefined,
          }
        : {
            street: guestInfo.address,
            address: guestInfo.address,
            city: DEFAULT_ADDRESS.city,
            district: DEFAULT_ADDRESS.district,
            ward: DEFAULT_ADDRESS.ward,
            phone: guestInfo.phone,
            label: "Khách lẻ",
          };

      const orderData = {
        restaurant: currentRestaurantId,
        items: items.map((item) => ({
          product: item.productId || item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        deliveryAddress: deliveryAddressPayload,
        paymentMethod: selectedPayment,
        note: note,
        voucherCode: voucherCode || undefined,
        subtotal: total,
        deliveryFee: deliveryFee,
        discount: discount,
        totalAmount: finalTotal,
        customerInfo: isAuthenticated ? undefined : guestInfo,
      };

      console.log("[Checkout] Creating order with data:", orderData);
      const response = await orderAPI.create(orderData);
      console.log("[Checkout] Order creation response:", response);

      if (!response?.data?._id || !response?.data?.paymentSession?.sessionId) {
        console.error("[Checkout] Invalid response structure:", response);
        throw new Error(
          "Không thể khởi tạo phiên thanh toán. Vui lòng thử lại."
        );
      }

      // Kiểm tra nếu là PayPal thì chuyển sang PayPalPaymentScreen
      if (selectedPayment === "paypal") {
        console.log("[Checkout] Navigating to PayPalPayment");
        navigation.replace("PayPalPayment", {
          orderId: response.data._id,
          amount: response.data.total,
          description: `Đơn hàng #${response.data.orderNumber} - ${items[0]?.restaurantName}`,
        });
        return;
      }

      const navigationParams = {
        orderId: response.data._id,
        orderNumber: response.data.orderNumber,
        amount: response.data.total,
        sessionId: response.data.paymentSession.sessionId,
        providerName: response.data.paymentSession.providerName,
        paymentMethod: selectedPayment,
        redirectUrl: response.data.paymentSession.redirectUrl,
        expiresAt: response.data.paymentSession.expiresAt,
        restaurantName: items[0]?.restaurantName,
      };

      console.log(
        "[Checkout] Navigating to ThirdPartyPayment with params:",
        navigationParams
      );
      navigation.replace("ThirdPartyPayment", navigationParams);
    } catch (error: any) {
      Alert.alert(
        "Lỗi",
        error.message || "Không thể tạo đơn hàng. Vui lòng thử lại!"
      );
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thanh toán</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyCart}>
          <Text style={styles.emptyCartIcon}>🛒</Text>
          <Text style={styles.emptyCartText}>Giỏ hàng trống</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButtonContainer}
        >
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        {/* Delivery Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionIcon}>📍</Text>
              <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
            </View>
            {isAuthenticated && (
              <TouchableOpacity onPress={() => navigation.navigate("Address")}>
                <Text style={styles.changeButton}>Thay đổi</Text>
              </TouchableOpacity>
            )}
          </View>
          {isAuthenticated ? (
            addresses.length === 0 ? (
              <TouchableOpacity
                style={styles.addAddressButton}
                onPress={() => navigation.navigate("Address")}
              >
                <Text style={styles.addAddressText}>+ Thêm địa chỉ mới</Text>
              </TouchableOpacity>
            ) : (
              addresses.map((address) => {
                const addressId = address._id || address.id;
                return (
                  <TouchableOpacity
                    key={addressId}
                    style={[
                      styles.addressCard,
                      selectedAddress === addressId &&
                        styles.addressCardSelected,
                    ]}
                    onPress={() => setSelectedAddress(addressId)}
                  >
                    <View style={styles.radioButton}>
                      {selectedAddress === addressId && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                    <View style={styles.addressInfo}>
                      <Text style={styles.addressName}>
                        {address.name || address.label}
                      </Text>
                      <Text style={styles.addressText}>
                        {address.address}
                        {address.ward && `, ${address.ward}`}
                        {address.district && `, ${address.district}`}
                        {address.city && `, ${address.city}`}
                      </Text>
                      <Text style={styles.addressPhone}>{address.phone}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )
          ) : (
            <View style={styles.guestForm}>
              <Text style={styles.guestHelper}>
                Bạn chưa đăng nhập – vui lòng cung cấp thông tin để nhận hàng.
              </Text>
              <Text style={styles.guestLabel}>Họ và tên</Text>
              <TextInput
                style={styles.guestInput}
                placeholder="Ví dụ: Nguyễn Văn A"
                value={guestInfo.name}
                onChangeText={(text) => handleGuestInfoChange("name", text)}
              />
              <Text style={styles.guestLabel}>Số điện thoại</Text>
              <TextInput
                style={styles.guestInput}
                placeholder="09xx xxx xxx"
                keyboardType="phone-pad"
                value={guestInfo.phone}
                onChangeText={(text) => handleGuestInfoChange("phone", text)}
              />
              <Text style={styles.guestLabel}>Email nhận hóa đơn</Text>
              <TextInput
                style={styles.guestInput}
                placeholder="ban@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={guestInfo.email}
                onChangeText={(text) => handleGuestInfoChange("email", text)}
              />
              <Text style={styles.guestLabel}>Địa chỉ giao hàng</Text>
              <TextInput
                style={[styles.guestInput, styles.guestInputMultiline]}
                placeholder="Số nhà, đường, phường, quận"
                multiline
                numberOfLines={2}
                value={guestInfo.address}
                onChangeText={(text) => handleGuestInfoChange("address", text)}
              />
            </View>
          )}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionIcon}>🍽️</Text>
            <Text style={styles.sectionTitle}>Đơn hàng</Text>
          </View>
          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName}>
              {items[0]?.restaurantName}
            </Text>
          </View>
          {items.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <Text
                style={styles.orderItemQuantity}
              >{`${item.quantity}x`}</Text>
              <Text style={styles.orderItemName}>{item.name}</Text>
              <Text style={styles.orderItemPrice}>
                {`${(item.price * item.quantity).toLocaleString("vi-VN")}đ`}
              </Text>
            </View>
          ))}
        </View>

        {/* Voucher */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionIcon}>🎫</Text>
            <Text style={styles.sectionTitle}>Mã giảm giá</Text>
          </View>
          <View style={styles.voucherInput}>
            <TextInput
              style={styles.voucherTextInput}
              placeholder="Nhập mã voucher"
              value={voucherCode}
              onChangeText={setVoucherCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={[
                styles.applyButton,
                applyingVoucher && styles.applyButtonDisabled,
              ]}
              onPress={handleApplyVoucher}
              disabled={applyingVoucher}
            >
              {applyingVoucher ? (
                <ActivityIndicator size="small" color="#EA5034" />
              ) : (
                <Text style={styles.applyButtonText}>Áp dụng</Text>
              )}
            </TouchableOpacity>
          </View>
          {discount > 0 && (
            <Text style={styles.discountText}>
              {`✓ Giảm giá: -${discount.toLocaleString("vi-VN")}đ`}
            </Text>
          )}
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionIcon}>💳</Text>
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          </View>
          <Text style={styles.paymentNote}>
            * Chỉ hỗ trợ thanh toán online để đảm bảo giao hàng nhanh bằng drone
          </Text>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentCard,
                selectedPayment === method.id && styles.paymentCardSelected,
              ]}
              onPress={() => setSelectedPayment(method.id)}
            >
              <View style={styles.radioButton}>
                {selectedPayment === method.id && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
              <Image
                source={{ uri: method.icon }}
                style={styles.paymentLogo}
                resizeMode="contain"
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.paymentName}>{method.name}</Text>
                <Text style={styles.paymentDescription}>
                  {method.description || "Thanh toán an toàn và nhanh chóng"}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Note */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionIcon}>📝</Text>
            <Text style={styles.sectionTitle}>Ghi chú</Text>
          </View>
          <TextInput
            style={styles.noteInput}
            placeholder="Ghi chú cho người bán..."
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Price Summary */}
        <View style={styles.section}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Tạm tính</Text>
            <Text style={styles.priceValue}>{`${total.toLocaleString(
              "vi-VN"
            )}đ`}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Phí giao hàng (Drone)</Text>
            <Text style={styles.priceValue}>{`${deliveryFee.toLocaleString(
              "vi-VN"
            )}đ`}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Giảm giá</Text>
              <Text style={styles.discountValue}>{`-${discount.toLocaleString(
                "vi-VN"
              )}đ`}</Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>{`${finalTotal.toLocaleString(
              "vi-VN"
            )}đ`}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerTotal}>
          <Text style={styles.footerTotalLabel}>Tổng thanh toán</Text>
          <Text style={styles.footerTotalValue}>{`${finalTotal.toLocaleString(
            "vi-VN"
          )}đ`}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.checkoutButton,
            loading && styles.checkoutButtonDisabled,
          ]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.checkoutButtonText}>Đặt hàng</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FB",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    fontSize: 24,
    color: "#EA5034",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  changeButton: {
    color: "#EA5034",
    fontSize: 14,
  },
  addAddressButton: {
    borderWidth: 1,
    borderColor: "#EA5034",
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  addAddressText: {
    color: "#EA5034",
    fontSize: 14,
    fontWeight: "500",
  },
  addressCard: {
    flexDirection: "row",
    padding: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    marginBottom: 8,
  },
  addressCardSelected: {
    borderColor: "#EA5034",
    backgroundColor: "#FFF5F3",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#EA5034",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#EA5034",
  },
  addressInfo: {
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 14,
    color: "#999",
  },
  guestForm: {
    borderWidth: 1,
    borderColor: "#f0f0f0",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#FFFDF8",
  },
  guestHelper: {
    fontSize: 13,
    color: "#555",
    marginBottom: 12,
  },
  guestLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  guestInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  guestInputMultiline: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  restaurantInfo: {
    marginBottom: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  orderItem: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  orderItemQuantity: {
    width: 40,
    fontSize: 14,
    color: "#666",
  },
  orderItemName: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  voucherInput: {
    flexDirection: "row",
  },
  voucherTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginRight: 8,
  },
  applyButton: {
    backgroundColor: "#EA5034",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: "center",
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  discountText: {
    color: "#27AE60",
    fontSize: 14,
    marginTop: 8,
  },
  paymentNote: {
    fontSize: 12,
    color: "#EA5034",
    marginBottom: 12,
    fontStyle: "italic",
  },
  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    marginBottom: 8,
  },
  paymentCardSelected: {
    borderColor: "#EA5034",
    backgroundColor: "#FFF5F3",
  },
  paymentIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentLogo: {
    width: 60,
    height: 40,
    marginRight: 12,
  },
  paymentName: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  paymentDescription: {
    fontSize: 11,
    color: "#777",
    marginTop: 2,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: "top",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: "#666",
  },
  priceValue: {
    fontSize: 14,
    color: "#333",
  },
  discountValue: {
    fontSize: 14,
    color: "#27AE60",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#EA5034",
  },
  footer: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  footerTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  footerTotalLabel: {
    fontSize: 14,
    color: "#666",
  },
  footerTotalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#EA5034",
  },
  checkoutButton: {
    backgroundColor: "#EA5034",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  checkoutButtonDisabled: {
    opacity: 0.6,
  },
  applyButtonDisabled: {
    opacity: 0.6,
  },
  emptyCart: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyCartIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyCartText: {
    fontSize: 18,
    color: "#999",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  successModal: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 280,
  },
  successIconContainer: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  successMessage: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
  },
});

export default CheckoutScreen;
