import mongoose from "mongoose";
import Review from "../models/Review.js";
import Order from "../models/Order.js";
import Restaurant from "../models/Restaurant.js";
import Product from "../models/Product.js";

const { ObjectId } = mongoose.Types;

const INITIAL_BREAKDOWN = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

const toObjectId = (value) => {
  if (!value) return null;
  if (value instanceof ObjectId) return value;
  return ObjectId.isValid(value) ? new ObjectId(value) : null;
};

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const combineClauses = (clauses) => {
  if (!clauses || clauses.length === 0) {
    return {};
  }
  if (clauses.length === 1) {
    return clauses[0];
  }
  return { $and: clauses };
};

const buildQueryClauses = async (req, options = {}) => {
  const {
    allowOwnerFallback = false,
    enforceCustomerOnSelf = false,
    requireRestaurant = false,
  } = options;

  const clauses = [];
  let resolvedRestaurantId = null;

  const { restaurantId, productId, orderId, rating, customerId, hasReply } =
    req.query || {};

  if (restaurantId) {
    const restId = toObjectId(restaurantId);
    if (restId) {
      clauses.push({ restaurant: restId });
      resolvedRestaurantId = restId;
    }
  } else if (allowOwnerFallback && req.user?.role === "restaurant") {
    const ownedRestaurant = await Restaurant.findOne(
      { owner: req.user._id },
      "_id"
    );
    if (!ownedRestaurant && requireRestaurant) {
      throw createHttpError(404, "Bạn chưa cấu hình thông tin nhà hàng");
    }
    if (ownedRestaurant) {
      clauses.push({ restaurant: ownedRestaurant._id });
      resolvedRestaurantId = ownedRestaurant._id;
    }
  } else if (requireRestaurant) {
    throw createHttpError(400, "Vui lòng cung cấp mã nhà hàng");
  }

  if (productId) {
    const prodId = toObjectId(productId);
    if (prodId) {
      clauses.push({ product: prodId });
    }
  }

  if (orderId) {
    const ordId = toObjectId(orderId);
    if (ordId) {
      clauses.push({ order: ordId });
    }
  }

  if (customerId) {
    const custId = toObjectId(customerId);
    if (custId) {
      clauses.push({ customer: custId });
    }
  } else if (enforceCustomerOnSelf && req.user?.role === "customer") {
    clauses.push({ customer: req.user._id });
  }

  if (rating) {
    const numericRating = Number(rating);
    if (!Number.isNaN(numericRating)) {
      clauses.push({ rating: numericRating });
    }
  }

  if (hasReply === "true") {
    clauses.push({ "restaurantReply.comment": { $exists: true, $ne: "" } });
  } else if (hasReply === "false") {
    clauses.push({
      $or: [
        { restaurantReply: { $exists: false } },
        { "restaurantReply.comment": { $exists: false } },
        { "restaurantReply.comment": "" },
      ],
    });
  }

  return { clauses, resolvedRestaurantId };
};

const populateReview = (reviewId) =>
  Review.findById(reviewId)
    .populate("customer", "name avatar")
    .populate("product", "name image price category")
    .populate("order", "orderNumber createdAt restaurant");

const recalcRestaurantStats = async (restaurantId) => {
  const normalizedId = toObjectId(restaurantId);
  if (!normalizedId) return;

  const stats = await Review.aggregate([
    { $match: { restaurant: normalizedId } },
    {
      $group: {
        _id: "$restaurant",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  const averageRating = stats[0]?.averageRating || 0;
  const totalReviews = stats[0]?.totalReviews || 0;

  await Restaurant.findByIdAndUpdate(normalizedId, {
    rating: averageRating ? Number(averageRating.toFixed(2)) : 0,
    totalReviews,
  });
};

const recalcProductStats = async (productId) => {
  const normalizedId = toObjectId(productId);
  if (!normalizedId) return;

  const stats = await Review.aggregate([
    { $match: { product: normalizedId } },
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  const averageRating = stats[0]?.averageRating || 0;
  const totalReviews = stats[0]?.totalReviews || 0;

  await Product.findByIdAndUpdate(normalizedId, {
    rating: averageRating ? Number(averageRating.toFixed(2)) : 0,
    totalReviews,
  });
};

export const getReviewSummary = async (req, res) => {
  try {
    const { clauses, resolvedRestaurantId } = await buildQueryClauses(req, {
      allowOwnerFallback: true,
      requireRestaurant: Boolean(req.query.restaurantId) ||
        req.user?.role === "restaurant",
    });

    const match = combineClauses(clauses);

    const summaryAgg = await Review.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const breakdownAgg = await Review.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
    ]);

    const summaryDoc = summaryAgg[0] || {};
    const breakdown = { ...INITIAL_BREAKDOWN };
    breakdownAgg.forEach((item) => {
      const key = item._id;
      if (key >= 1 && key <= 5) {
        breakdown[key] = item.count;
      }
    });

    let pendingReplyCount = 0;
    if (resolvedRestaurantId) {
      const pendingClauses = [
        ...clauses,
        {
          $or: [
            { restaurantReply: { $exists: false } },
            { "restaurantReply.comment": { $exists: false } },
            { "restaurantReply.comment": "" },
          ],
        },
      ];
      const pendingMatch = combineClauses(pendingClauses);
      pendingReplyCount = await Review.countDocuments(pendingMatch);
    }

    res.json({
      success: true,
      data: {
        averageRating: summaryDoc.averageRating
          ? Number(summaryDoc.averageRating.toFixed(2))
          : 0,
        totalReviews: summaryDoc.totalReviews || 0,
        breakdown,
        pendingReplyCount,
      },
    });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const getReviews = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;
    const sortOption =
      req.query.sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

    const { clauses } = await buildQueryClauses(req, {
      allowOwnerFallback: true,
      enforceCustomerOnSelf: true,
    });

    const match = combineClauses(clauses);

    const [reviews, total] = await Promise.all([
      Review.find(match)
        .populate("customer", "name avatar")
        .populate("product", "name image price category")
        .populate("order", "orderNumber createdAt restaurant")
        .sort(sortOption)
        .skip(skip)
        .limit(limit),
      Review.countDocuments(match),
    ]);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page,
        pageSize: limit,
        total,
        totalPages: Math.ceil(total / limit) || 0,
      },
    });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const createReview = async (req, res) => {
  try {
    const { orderId, productId, rating, comment, images } = req.body || {};

    if (!orderId) {
      throw createHttpError(400, "Vui lòng cung cấp mã đơn hàng");
    }

    const numericRating = Number(rating);
    if (Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      throw createHttpError(400, "Điểm đánh giá không hợp lệ");
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throw createHttpError(404, "Không tìm thấy đơn hàng");
    }

    if (order.customer.toString() !== req.user._id.toString()) {
      throw createHttpError(403, "Bạn không thể đánh giá đơn hàng này");
    }

    console.log(`📝 Review attempt - Order ${orderId}: status = "${order.status}", customer = ${order.customer}`);

    // Cho phép đánh giá đơn đã hoàn thành hoặc đã hủy (lịch sử)
    const allowedStatuses = ["delivered", "completed", "cancelled"];
    if (!allowedStatuses.includes(order.status)) {
      console.log(`❌ Review rejected - Order status "${order.status}" is not in history`);
      throw createHttpError(400, `Chỉ đánh giá được đơn hàng trong lịch sử. Status hiện tại: ${order.status}`);
    }

    let resolvedProductId = null;
    if (productId) {
      const matchItem = order.items.find(
        (item) => item.product.toString() === productId
      );
      if (!matchItem) {
        throw createHttpError(400, "Món ăn không thuộc đơn hàng này");
      }
      resolvedProductId = matchItem.product;
    } else if (order.items?.length > 0) {
      resolvedProductId = order.items[0].product;
    }

    const trimmedComment = typeof comment === "string" ? comment.trim() : "";
    const imageList = Array.isArray(images) ? images.slice(0, 6) : [];

    const reviewClauses = [
      { order: order._id },
      { customer: req.user._id },
    ];
    if (resolvedProductId) {
      reviewClauses.push({ product: resolvedProductId });
    }

    const existingReview = await Review.findOne(combineClauses(reviewClauses));

    let review;
    if (existingReview) {
      existingReview.rating = numericRating;
      existingReview.comment = trimmedComment;
      existingReview.images = imageList;
      if (resolvedProductId) {
        existingReview.product = resolvedProductId;
      }
      await existingReview.save();
      review = existingReview;
    } else {
      review = await Review.create({
        order: order._id,
        customer: req.user._id,
        restaurant: order.restaurant,
        product: resolvedProductId,
        rating: numericRating,
        comment: trimmedComment,
        images: imageList,
      });
    }

    order.isReviewed = true;
    order.customerReview = {
      rating: numericRating,
      comment: trimmedComment,
      product: resolvedProductId,
      images: imageList,
      reviewedAt: new Date(),
    };
    await order.save();

    await recalcRestaurantStats(order.restaurant);
    if (resolvedProductId) {
      await recalcProductStats(resolvedProductId);
    }

    const populatedReview = await populateReview(review._id);

    res.status(existingReview ? 200 : 201).json({
      success: true,
      data: populatedReview,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const replyToReview = async (req, res) => {
  try {
    const { comment } = req.body || {};
    const trimmedComment = typeof comment === "string" ? comment.trim() : "";

    if (!trimmedComment) {
      throw createHttpError(400, "Vui lòng nhập nội dung phản hồi");
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      throw createHttpError(404, "Không tìm thấy đánh giá");
    }

    if (req.user.role === "restaurant") {
      const ownedRestaurant = await Restaurant.findOne(
        { owner: req.user._id },
        "_id"
      );
      if (!ownedRestaurant) {
        throw createHttpError(403, "Bạn chưa được liên kết với nhà hàng nào");
      }
      if (ownedRestaurant._id.toString() !== review.restaurant.toString()) {
        throw createHttpError(403, "Bạn không thể phản hồi đánh giá này");
      }
    }

    review.restaurantReply = {
      comment: trimmedComment,
      timestamp: new Date(),
    };
    await review.save();

    const populatedReview = await populateReview(review._id);

    res.json({
      success: true,
      data: populatedReview,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, message: error.message });
  }
};
