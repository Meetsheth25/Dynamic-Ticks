import asyncHandler from 'express-async-handler';
import Review from './review.model.js';
import Product from '../product/product.model.js';
import Order from '../order/order.model.js';
import mongoose from 'mongoose';

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
export const createReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment } = req.body;

  const product = await Product.findById(productId);

  if (product) {
    const hasBought = await Order.findOne({
      userId: new mongoose.Types.ObjectId(req.user._id),
      'orderItems.product': new mongoose.Types.ObjectId(productId),
    });

    if (!hasBought) {
      res.status(400);
      throw new Error('You can only review models you have actively acquired.');
    }

    const alreadyReviewed = await Review.findOne({
      productId,
      userId: req.user._id,
    });

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed');
    }

    const review = await Review.create({
      userId: req.user._id,
      productId,
      rating: Number(rating),
      comment,
    });

    // Update product rating and reviews count
    const reviews = await Review.find({ productId });
    product.reviews = reviews.length;
    product.rating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    await product.save();

    res.status(201).json(review);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Get product reviews
// @route   GET /api/reviews/:productId
// @access  Public
export const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ productId: req.params.productId }).populate('userId', 'name');
  res.json(reviews);
});
