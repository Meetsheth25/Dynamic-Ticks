import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({});
  res.json(products);
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
  try {
    console.log("--- START CREATE PRODUCT ---");
    console.log("REQ BODY keys:", Object.keys(req.body));
    console.log("REQ FILES raw:", req.files);
    
    const { name, price, category, description, countInStock, returnAvailable, returnDays, returnHours } = req.body;
    
    if (!req.files || req.files.length === 0) {
      console.log("WARNING: No files received in req.files");
    } else {
      console.log(`RECEIVED ${req.files.length} FILES`);
    }

    const imagePaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    console.log("MAPPED IMAGE PATHS:", imagePaths);
    
    const product = new Product({
      name,
      price: Number(price),
      category,
      images: imagePaths,
      description: description || 'Premium Luxury Watch',
      countInStock: Number(countInStock) || 0,
      returnAvailable: returnAvailable === 'true' || returnAvailable === true,
      returnDays: Number(returnDays) || 0,
      returnHours: Number(returnHours) || 0
    });

    console.log("IMAGES:", product.images);
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
  try {
    console.log("--- START UPDATE PRODUCT ---");
    console.log("REQ ID:", req.params.id);
    console.log("REQ BODY keys:", Object.keys(req.body));
    console.log("REQ FILES raw:", req.files);
    
    const { name, price, description, category, countInStock, returnAvailable, returnDays, returnHours } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      console.log("FILES (Update):", req.files);
      
      product.name = name || product.name;
      product.price = price !== undefined ? Number(price) : product.price;
      product.description = description || product.description;
      product.category = category || product.category;
      product.countInStock = countInStock !== undefined ? Number(countInStock) : product.countInStock;
      product.returnAvailable = returnAvailable !== undefined ? (returnAvailable === 'true' || returnAvailable === true) : product.returnAvailable;
      product.returnDays = returnDays !== undefined ? Number(returnDays) : product.returnDays;
      product.returnHours = returnHours !== undefined ? Number(returnHours) : product.returnHours;
      
      if (req.files && req.files.length > 0) {
        product.images = req.files.map(file => `/uploads/${file.filename}`);
      }
      
      console.log("IMAGES (Update):", product.images);
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});
