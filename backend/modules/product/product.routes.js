import express from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from './product.controller.js';
import { protect, admin } from '../../middleware/authMiddleware.js';
import upload from '../../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, admin, upload.any(), createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, admin, upload.any(), updateProduct)
  .delete(protect, admin, deleteProduct);

export default router;
