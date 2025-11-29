import fetch from "node-fetch";

// Lấy Access Token từ PayPal
const generateAccessToken = async () => {
  try {
    const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
    const APP_SECRET = process.env.PAYPAL_APP_SECRET;
    const BASE_URL = process.env.PAYPAL_API_URL;

    if (!CLIENT_ID || !APP_SECRET) {
      throw new Error("PayPal credentials not configured");
    }

    const auth = Buffer.from(CLIENT_ID + ":" + APP_SECRET).toString("base64");
    const response = await fetch(`${BASE_URL}/v1/oauth2/token`, {
      method: "POST",
      body: "grant_type=client_credentials",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error generating PayPal access token:", error);
    throw error;
  }
};

// Tạo đơn hàng PayPal
export const createPayPalOrder = async (req, res) => {
  try {
    const { amount, orderId, description } = req.body;

    if (!amount || !orderId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: amount, orderId",
      });
    }

    // Validate amount
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    const accessToken = await generateAccessToken();
    const BASE_URL = process.env.PAYPAL_API_URL;

    const response = await fetch(`${BASE_URL}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: orderId,
            amount: {
              currency_code: "USD",
              value: amountValue.toFixed(2),
            },
            description: description || `Order #${orderId}`,
          },
        ],
        application_context: {
          brand_name: "FoodFast",
          landing_page: "LOGIN",
          user_action: "PAY_NOW",
          shipping_preference: "NO_SHIPPING",
          return_url: `${process.env.PAYPAL_RETURN_URL}?orderId=${orderId}`,
          cancel_url: `${process.env.PAYPAL_CANCEL_URL}?orderId=${orderId}`,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("PayPal API Error:", data);
      return res.status(response.status).json({
        success: false,
        message: "Failed to create PayPal order",
        error: data,
      });
    }

    // Lấy approval URL
    const approvalUrl = data.links?.find(link => link.rel === "approve")?.href;

    res.json({
      success: true,
      data: {
        id: data.id,
        status: data.status,
        approvalUrl: approvalUrl,
      },
    });
  } catch (error) {
    console.error("Error creating PayPal order:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Xác nhận thanh toán PayPal
export const capturePayPalOrder = async (req, res) => {
  try {
    const { paypalOrderId, orderId } = req.body;

    if (!paypalOrderId) {
      return res.status(400).json({
        success: false,
        message: "Missing PayPal order ID",
      });
    }

    const accessToken = await generateAccessToken();
    const BASE_URL = process.env.PAYPAL_API_URL;

    const response = await fetch(
      `${BASE_URL}/v2/checkout/orders/${paypalOrderId}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("PayPal Capture Error:", data);
      return res.status(response.status).json({
        success: false,
        message: "Failed to capture PayPal payment",
        error: data,
      });
    }

    // Kiểm tra trạng thái thanh toán
    const isCompleted = data.status === "COMPLETED";

    if (isCompleted) {
      // Lấy thông tin thanh toán
      const captureDetails = data.purchase_units?.[0]?.payments?.captures?.[0];
      const payerInfo = data.payer;

      console.log("✅ PayPal payment completed:", {
        paypalOrderId: data.id,
        orderId: orderId,
        payer: payerInfo?.name?.given_name,
        amount: captureDetails?.amount?.value,
        currency: captureDetails?.amount?.currency_code,
      });

      res.json({
        success: true,
        data: {
          status: data.status,
          paypalOrderId: data.id,
          orderId: orderId,
          payer: {
            name: payerInfo?.name?.given_name + " " + payerInfo?.name?.surname,
            email: payerInfo?.email_address,
          },
          payment: {
            amount: captureDetails?.amount?.value,
            currency: captureDetails?.amount?.currency_code,
            transactionId: captureDetails?.id,
          },
        },
      });
    } else {
      res.json({
        success: false,
        message: "Payment not completed",
        data: {
          status: data.status,
          paypalOrderId: data.id,
        },
      });
    }
  } catch (error) {
    console.error("Error capturing PayPal order:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Webhook handler (optional - for production)
export const handlePayPalWebhook = async (req, res) => {
  try {
    const webhookEvent = req.body;

    console.log("PayPal Webhook received:", webhookEvent.event_type);

    // Xử lý các event từ PayPal
    switch (webhookEvent.event_type) {
      case "PAYMENT.CAPTURE.COMPLETED":
        // Xử lý khi thanh toán thành công
        console.log("Payment captured:", webhookEvent.resource);
        break;
      case "PAYMENT.CAPTURE.DENIED":
        // Xử lý khi thanh toán bị từ chối
        console.log("Payment denied:", webhookEvent.resource);
        break;
      default:
        console.log("Unhandled event type:", webhookEvent.event_type);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Error handling PayPal webhook:", error);
    res.status(500).json({
      success: false,
      message: "Webhook handler error",
    });
  }
};
