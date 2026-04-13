import express from 'express';
import { createReview, getProductReviews } from './review.controller.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createReview);

router.route('/:productId')
  .get(getProductReviews);

export default router;
