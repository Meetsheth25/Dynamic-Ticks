import asyncHandler from 'express-async-handler';
import Cart from '../models/Cart.js';

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ userId: req.user._id });

  if (!cart) {
    cart = await Cart.create({ userId: req.user._id, items: [] });
  }
  res.json(cart);
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = asyncHandler(async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("USER:", req.user);
    
    const { product, customDesign, name, qty, image, price } = req.body;
    
    if (!product && !customDesign) {
      return res.status(400).json({ message: "Product ID required" });
    }

    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      item => (product && item.product?.toString() === product) || (customDesign && item.customDesign?.toString() === customDesign)
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].qty += qty;
    } else {
      cart.items.push({ product, customDesign, name, qty, image, price });
    }

    const updatedCart = await cart.save();
    res.status(201).json(updatedCart);
    
  } catch (error) {
    console.error("CART ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
export const removeFromCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ userId: req.user._id });

  if (cart) {
    cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
    const updatedCart = await cart.save();
    res.json(updatedCart);
  } else {
    res.status(404);
    throw new Error('Cart not found');
  }
});
