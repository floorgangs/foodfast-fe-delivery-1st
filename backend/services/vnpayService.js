import crypto from "crypto";
import querystring from "qs";
import moment from "moment";

class VNPayService {
  constructor() {
    this.vnpayConfig = {
      vnp_TmnCode: process.env.VNPAY_TMN_CODE,
      vnp_HashSecret: process.env.VNPAY_HASH_SECRET,
      vnp_Url: process.env.VNPAY_URL,
      vnp_ReturnUrl: process.env.VNPAY_RETURN_URL,
    };
  }

  sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    keys.forEach((key) => {
      sorted[key] = obj[key];
    });
    return sorted;
  }

  createPaymentUrl(orderId, amount, orderInfo, ipAddr) {
    const date = new Date();
    const createDate = moment(date).format("YYYYMMDDHHmmss");
    const txnRef = `${orderId}_${moment(date).format("DDHHmmss")}`;

    let vnp_Params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: this.vnpayConfig.vnp_TmnCode,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: "other",
      vnp_Amount: amount * 100, // VNPay requires amount in VND * 100
      vnp_ReturnUrl: this.vnpayConfig.vnp_ReturnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    vnp_Params = this.sortObject(vnp_Params);

    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", this.vnpayConfig.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;

    const paymentUrl =
      this.vnpayConfig.vnp_Url +
      "?" +
      querystring.stringify(vnp_Params, { encode: false });

    return paymentUrl;
  }

  verifyReturnUrl(vnpParams) {
    const secureHash = vnpParams["vnp_SecureHash"];
    delete vnpParams["vnp_SecureHash"];
    delete vnpParams["vnp_SecureHashType"];

    const sortedParams = this.sortObject(vnpParams);
    const signData = querystring.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac("sha512", this.vnpayConfig.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    return secureHash === signed;
  }
}

export default new VNPayService();
