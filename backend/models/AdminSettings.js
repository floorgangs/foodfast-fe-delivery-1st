import mongoose from "mongoose";

const adminSettingsSchema = new mongoose.Schema(
  {
    // PayPal Configuration
    paypalEmail: {
      type: String,
      required: true,
    },
    paypalClientId: {
      type: String,
    },
    paypalClientSecret: {
      type: String,
    },
    
    // Financial Settings
    commissionRate: {
      type: Number,
      default: 10, // 10% commission
      min: 0,
      max: 100,
    },
    minWithdrawAmount: {
      type: Number,
      default: 100000, // 100,000 VND
    },
    
    // System Balance (Total money in admin's PayPal)
    systemBalance: {
      type: Number,
      default: 0,
    },
    
    // Auto-payout settings
    autoPayoutEnabled: {
      type: Boolean,
      default: false,
    },
    autoPayoutThreshold: {
      type: Number,
      default: 1000000, // Auto payout when restaurant balance reaches 1M
    },
    
    // Statistics
    totalRevenue: {
      type: Number,
      default: 0,
    },
    totalCommission: {
      type: Number,
      default: 0,
    },
    totalPayouts: {
      type: Number,
      default: 0,
    },
    
    // Last updated by
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one settings document exists
adminSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      paypalEmail: "admin@foodfast.com",
    });
  }
  return settings;
};

export default mongoose.model("AdminSettings", adminSettingsSchema);
