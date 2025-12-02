import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { voucherAPI } from "../services/api";

interface Voucher {
  _id: string;
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderValue: number;
  maxDiscountValue?: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  maxUsage: number;
  currentUsage: number;
}

const VouchersScreen = ({ navigation }: any) => {
  const [selectedTab, setSelectedTab] = useState<"available" | "used">(
    "available"
  );
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchVouchers = async () => {
    try {
      const response = await voucherAPI.getAll();
      setVouchers(response.data || response);
    } catch (error: any) {
      console.error("Fetch vouchers error:", error);
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Không thể tải danh sách voucher"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchVouchers();
  };

  const formatDiscount = (voucher: Voucher) => {
    if (voucher.discountType === "percentage") {
      return `${voucher.discountValue}%`;
    }
    return `${voucher.discountValue.toLocaleString("vi-VN")}đ`;
  };

  const isVoucherUsedUp = (voucher: Voucher) => {
    return voucher.currentUsage >= voucher.maxUsage;
  };

  const availableVouchers = vouchers.filter(
    (v) => v.isActive && !isVoucherUsedUp(v)
  );
  const usedVouchers = vouchers.filter(
    (v) => !v.isActive || isVoucherUsedUp(v)
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ưu đãi của tôi</Text>
        <View style={{ width: 70 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "available" && styles.tabActive]}
          onPress={() => setSelectedTab("available")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "available" && styles.tabTextActive,
            ]}
          >
            Khả dụng ({availableVouchers.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "used" && styles.tabActive]}
          onPress={() => setSelectedTab("used")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "used" && styles.tabTextActive,
            ]}
          >
            Đã dùng ({usedVouchers.length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EA5034" />
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#EA5034"]}
            />
          }
        >
          {selectedTab === "available" &&
            availableVouchers.map((voucher) => (
              <View key={voucher._id} style={styles.voucherCard}>
                <View style={styles.voucherLeft}>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>
                      {formatDiscount(voucher)}
                    </Text>
                    <Text style={styles.discountLabel}>OFF</Text>
                  </View>
                </View>

                <View style={styles.voucherRight}>
                  <View style={styles.voucherInfo}>
                    <Text style={styles.voucherTitle}>{voucher.code}</Text>
                    <Text style={styles.voucherDescription}>
                      {voucher.description}
                    </Text>
                    <View style={styles.voucherDetails}>
                      <Text style={styles.voucherDetailText}>
                        📦 Đơn tối thiểu:{" "}
                        {String(
                          (voucher.minOrderValue ?? 0).toLocaleString("vi-VN")
                        )}
                        đ
                      </Text>
                      {voucher.maxDiscountValue && (
                        <Text style={styles.voucherDetailText}>
                          🎯 Giảm tối đa:{" "}
                          {String(
                            (voucher.maxDiscountValue ?? 0).toLocaleString(
                              "vi-VN"
                            )
                          )}
                          đ
                        </Text>
                      )}
                      <Text style={styles.voucherDetailText}>
                        ⏰ HSD:{" "}
                        {new Date(voucher.validTo).toLocaleDateString("vi-VN")}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.voucherCodeSection}>
                    <View style={styles.voucherCode}>
                      <Text style={styles.voucherCodeText}>{voucher.code}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.useButton}
                      onPress={() => navigation.navigate("Home")}
                    >
                      <Text style={styles.useButtonText}>Dùng ngay</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}

          {selectedTab === "used" &&
            usedVouchers.map((voucher) => (
              <View
                key={voucher._id}
                style={[styles.voucherCard, styles.voucherCardUsed]}
              >
                <View style={styles.voucherLeft}>
                  <View
                    style={[styles.discountBadge, styles.discountBadgeUsed]}
                  >
                    <Text
                      style={[styles.discountText, styles.discountTextUsed]}
                    >
                      {formatDiscount(voucher)}
                    </Text>
                    <Text
                      style={[styles.discountLabel, styles.discountLabelUsed]}
                    >
                      OFF
                    </Text>
                  </View>
                </View>

                <View style={styles.voucherRight}>
                  <View style={styles.voucherInfo}>
                    <Text
                      style={[styles.voucherTitle, styles.voucherTitleUsed]}
                    >
                      {voucher.code}
                    </Text>
                    <Text
                      style={[
                        styles.voucherDescription,
                        styles.voucherDescriptionUsed,
                      ]}
                    >
                      {voucher.description}
                    </Text>
                    <View style={styles.usedBadge}>
                      <Text style={styles.usedBadgeText}>Đã hết lượt</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}

          {selectedTab === "available" && availableVouchers.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🎁</Text>
              <Text style={styles.emptyText}>Chưa có voucher khả dụng</Text>
            </View>
          )}

          {selectedTab === "used" && usedVouchers.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>Chưa có voucher đã dùng</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    fontSize: 16,
    color: "#EA5034",
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#EA5034",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#EA5034",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  voucherCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  voucherCardUsed: {
    opacity: 0.6,
  },
  voucherLeft: {
    width: 100,
    backgroundColor: "#FFF5F3",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  discountBadge: {
    alignItems: "center",
  },
  discountBadgeUsed: {
    opacity: 0.5,
  },
  discountText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#EA5034",
  },
  discountTextUsed: {
    color: "#999",
  },
  discountLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#EA5034",
    marginTop: 4,
  },
  discountLabelUsed: {
    color: "#999",
  },
  voucherRight: {
    flex: 1,
    padding: 16,
  },
  voucherInfo: {
    marginBottom: 12,
  },
  voucherTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  voucherTitleUsed: {
    color: "#999",
  },
  voucherDescription: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
  },
  voucherDescriptionUsed: {
    color: "#999",
  },
  voucherDetails: {
    marginTop: 4,
  },
  voucherDetailText: {
    fontSize: 12,
    color: "#999",
    marginBottom: 2,
  },
  voucherCodeSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  voucherCode: {
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#EA5034",
    borderStyle: "dashed",
  },
  voucherCodeText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#EA5034",
  },
  useButton: {
    backgroundColor: "#EA5034",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  useButtonText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
  },
  usedBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
  },
  usedBadgeText: {
    fontSize: 12,
    color: "#999",
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
});

export default VouchersScreen;
