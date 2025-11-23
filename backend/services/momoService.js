import crypto from "crypto";
import axios from "axios";

class MoMoService {
  constructor() {
    this.config = {
      partnerCode: process.env.MOMO_PARTNER_CODE || "MOMOBKUN20180529",
      accessKey: process.env.MOMO_ACCESS_KEY || "klm05TvNBzhg7h7j",
      secretKey:
        process.env.MOMO_SECRET_KEY || "at67qH6mk8w5Y1NH7yMXYMHWrUwcb5r",
      endpoint:
        process.env.MOMO_ENDPOINT ||
        "https://test-payment.momo.vn/v2/gateway/api/create",
      returnUrl:
        process.env.MOMO_RETURN_URL ||
        "http://localhost:5173/payment-return/momo",
      ipnUrl:
        process.env.MOMO_IPN_URL ||
        "http://localhost:5000/api/payments/momo/ipn",
    };
    console.log("✅ MoMo Config loaded:", {
      partnerCode: this.config.partnerCode,
      endpoint: this.config.endpoint,
    });
  }

  async createPayment(orderId, amount, orderInfo, extraData = "") {
    const requestId = `${orderId}_${Date.now()}`;
    const requestType = "captureWallet";

    const rawSignature = `accessKey=${this.config.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${this.config.ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${this.config.partnerCode}&redirectUrl=${this.config.returnUrl}&requestId=${requestId}&requestType=${requestType}`;

    const signature = crypto
      .createHmac("sha256", this.config.secretKey)
      .update(rawSignature)
      .digest("hex");

    const requestBody = {
      partnerCode: this.config.partnerCode,
      accessKey: this.config.accessKey,
      requestId: requestId,
      amount: amount.toString(),
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: this.config.returnUrl,
      ipnUrl: this.config.ipnUrl,
      extraData: extraData,
      requestType: requestType,
      signature: signature,
      lang: "vi",
    };

    try {
      const response = await axios.post(this.config.endpoint, requestBody, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error) {
      console.error("MoMo API Error:", error.response?.data || error.message);
      throw new Error("Không thể tạo thanh toán MoMo");
    }
  }

  verifySignature(data) {
    const { signature, ...params } = data;

    const rawSignature = `accessKey=${params.accessKey}&amount=${params.amount}&extraData=${params.extraData}&message=${params.message}&orderId=${params.orderId}&orderInfo=${params.orderInfo}&orderType=${params.orderType}&partnerCode=${params.partnerCode}&payType=${params.payType}&requestId=${params.requestId}&responseTime=${params.responseTime}&resultCode=${params.resultCode}&transId=${params.transId}`;

    const computedSignature = crypto
      .createHmac("sha256", this.config.secretKey)
      .update(rawSignature)
      .digest("hex");

    return signature === computedSignature;
  }
}

export default new MoMoService();
