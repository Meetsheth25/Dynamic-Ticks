import asyncHandler from 'express-async-handler';
import Product from './product.model.js';

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

    const { name, price, category, targetAudience, description, countInStock, returnAvailable, returnDays, returnHours, caseDiameter, bandMaterial, movementType, itemWeight, countryOfOrigin } = req.body;

    // Parse colorVariants JSON array sent from frontend
    let colorVariants = [];
    if (req.body.colorVariants) {
      try { colorVariants = JSON.parse(req.body.colorVariants); } catch(e) {}
    }

    // Map per-variant uploaded images (field: colorImages_<index>)
    if (req.files) {
      colorVariants = colorVariants.map((variant, idx) => {
        const variantFiles = req.files.filter(f => f.fieldname === `colorImages_${idx}`);
        return {
          ...variant,
          images: variantFiles.length > 0
            ? variantFiles.map(f => `/uploads/${f.filename}`)
            : (variant.images || [])
        };
      });
    }

    if (!req.files || req.files.length === 0) {
      console.log("WARNING: No files received in req.files");
    }

    // Default product images = first variant's images, or explicit images field
    const defaultImages = req.files
      ? req.files.filter(f => f.fieldname === 'images').map(file => `/uploads/${file.filename}`)
      : [];

    console.log("MAPPED IMAGE PATHS:", defaultImages);

    // If variants exist, countInStock = sum of all variant stocks
    const totalStock = colorVariants.length > 0
      ? colorVariants.reduce((sum, v) => sum + (Number(v.countInStock) || 0), 0)
      : (Number(countInStock) || 0);

    const product = new Product({
      name,
      price: Number(price),
      category,
      targetAudience: targetAudience || 'Unisex',
      colorVariants,
      images: defaultImages.length ? defaultImages : (colorVariants[0]?.images || []),
      description: description || 'Premium Luxury Watch',
      countInStock: totalStock,
      caseDiameter: caseDiameter || '',
      bandMaterial: bandMaterial || '',
      movementType: movementType || '',
      itemWeight: itemWeight || '',
      countryOfOrigin: countryOfOrigin || 'Hong Kong',
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

    const { name, price, description, category, targetAudience, countInStock, returnAvailable, returnDays, returnHours, caseDiameter, bandMaterial, movementType, itemWeight, countryOfOrigin } = req.body;

    // Parse colorVariants
    let colorVariants;
    if (req.body.colorVariants !== undefined) {
      try { colorVariants = JSON.parse(req.body.colorVariants); } catch(e) {}
    }

    const product = await Product.findById(req.params.id);

    if (product) {
      console.log("FILES (Update):", req.files);

      product.name = name || product.name;
      product.price = price !== undefined ? Number(price) : product.price;
      product.description = description || product.description;
      product.category = category || product.category;
      product.targetAudience = targetAudience || product.targetAudience;
      product.caseDiameter    = caseDiameter    !== undefined ? caseDiameter    : product.caseDiameter;
      product.bandMaterial    = bandMaterial    !== undefined ? bandMaterial    : product.bandMaterial;
      product.movementType    = movementType    !== undefined ? movementType    : product.movementType;
      product.itemWeight      = itemWeight      !== undefined ? itemWeight      : product.itemWeight;
      product.countryOfOrigin = countryOfOrigin !== undefined ? countryOfOrigin : product.countryOfOrigin;
      product.returnAvailable = returnAvailable !== undefined ? (returnAvailable === 'true' || returnAvailable === true) : product.returnAvailable;
      product.returnDays = returnDays !== undefined ? Number(returnDays) : product.returnDays;
      product.returnHours = returnHours !== undefined ? Number(returnHours) : product.returnHours;

      // Update colorVariants if provided, merging in uploaded images per variant
      if (colorVariants !== undefined) {
        if (req.files) {
          colorVariants = colorVariants.map((variant, idx) => {
            const variantFiles = req.files.filter(f => f.fieldname === `colorImages_${idx}`);
            return {
              ...variant,
              images: variantFiles.length > 0
                ? variantFiles.map(f => `/uploads/${f.filename}`)
                : (variant.images || [])
            };
          });
        }
        product.colorVariants = colorVariants;

        // Auto-sum variant stocks → product-level countInStock
        product.countInStock = colorVariants.reduce((sum, v) => sum + (Number(v.countInStock) || 0), 0);
      } else if (countInStock !== undefined) {
        product.countInStock = Number(countInStock);
      }

      // Update default images if explicit 'images' files were uploaded
      const defaultFiles = req.files ? req.files.filter(f => f.fieldname === 'images') : [];
      if (defaultFiles.length > 0) {
        product.images = defaultFiles.map(file => `/uploads/${file.filename}`);
      } else if (product.colorVariants?.length > 0 && product.images.length === 0) {
        product.images = product.colorVariants[0]?.images || [];
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
