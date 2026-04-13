import asyncHandler from 'express-async-handler';
import Order from './order.model.js';
import Cart from '../cart/cart.model.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const addOrderItems = asyncHandler(async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("USER:", req.user);

    const { orderItems, shippingAddress, paymentMethod, itemsPrice, shippingPrice, totalPrice, isPaid } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    const order = new Order({
      orderItems,
      userId: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      isPaid: isPaid ?? (paymentMethod !== 'COD'),
      status: 'processing'
    });

    const createdOrder = await order.save();
    await Cart.findOneAndDelete({ userId: req.user._id });
    
    res.status(201).json(createdOrder);
    
  } catch (error) {
    console.error("ORDER ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('userId', 'name email')
    .populate('orderItems.product');

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/my
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ userId: req.user._id })
    .populate('orderItems.product', 'name returnAvailable returnDays returnHours')
    .sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
      .populate('userId', 'name email')
      .populate('orderItems.product', 'name price');
      
  res.json(orders);
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.status = req.body.status;
    
    if (order.status.toLowerCase() === 'delivered') {
      order.isPaid = true;
      order.deliveredAt = Date.now();
      order.status = 'delivered';
    } else if (order.status.toLowerCase() === 'completed') {
      order.isPaid = true;
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private/Admin
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.status = 'cancelled';
    order.refundStatus = 'processing';
    const updatedOrder = await order.save();

    // After 30 minutes, set refundStatus to 'refunded'
    setTimeout(async () => {
      try {
        const orderToUpdate = await Order.findById(order._id);
        if (orderToUpdate && orderToUpdate.status === 'cancelled') {
          orderToUpdate.refundStatus = 'refunded';
          await orderToUpdate.save();
          console.log(`Order ${order._id} refund status updated to refunded`);
        }
      } catch (error) {
        console.error("Refund timer error:", error);
      }
    }, 30 * 60 * 1000);

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

export const returnOrder = asyncHandler(async (req, res) => {
  const { reason, description } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Security: ensure the user owns the order
  if (order.userId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to return this order');
  }

  // Strict rule: only delivered orders
  if (order.status !== 'delivered') {
    return res.status(400).json({
      message: "Return allowed only after delivery"
    });
  }

  // Prevent duplicate return requests
  if (order.status === 'return_requested' || order.status === 'returned') {
    return res.status(400).json({
      message: "Return already requested"
    });
  }

  order.status = 'return_requested';
  order.returnRequest = {
    reason,
    description,
    status: 'pending',
    adminDecision: null
  };

  const updatedOrder = await order.save();
  res.json(updatedOrder);
});

// @desc    Approve return
// @route   PUT /api/orders/:id/return/approve
// @access  Private/Admin
export const approveReturn = asyncHandler(async (req, res) => {
  const { adminDecision } = req.body; // 'refund' or 'exchange'
  const order = await Order.findById(req.params.id);

  if (order && order.returnRequest) {
    order.returnRequest.status = 'approved';
    order.returnRequest.adminDecision = adminDecision;

    if (adminDecision === 'refund') {
      order.status = 'returned';
      order.refundStatus = 'processing';
      
      // Timer for refund (simulation)
      setTimeout(async () => {
        try {
          const orderToUpdate = await Order.findById(order._id);
          if (orderToUpdate && orderToUpdate.refundStatus === 'processing') {
            orderToUpdate.refundStatus = 'refunded';
            await orderToUpdate.save();
          }
        } catch (error) {
          console.error("Refund timer error:", error);
        }
      }, 30 * 60 * 1000);

    } else if (adminDecision === 'exchange') {
      order.status = 'exchange_in_progress';
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Reject return
// @route   PUT /api/orders/:id/return/reject
// @access  Private/Admin
export const rejectReturn = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order && order.returnRequest) {
    order.status = 'delivered';
    order.returnRequest.status = 'rejected';
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order shipping address
// @route   PUT /api/orders/:id/address
// @access  Private
export const updateOrderAddress = asyncHandler(async (req, res) => {
  const { address, city, postalCode, country } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Security: ensure the user owns the order
  if (order.userId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this order');
  }

  // Constraint: Cannot change address if out for delivery or delivered
  if (['out_for_delivery', 'delivered'].includes(order.deliveryStatus)) {
    return res.status(400).json({
      message: `Cannot change address after order is ${order.deliveryStatus.replace(/_/g, ' ')}`
    });
  }

  order.shippingAddress = {
    address: address || order.shippingAddress.address,
    city: city || order.shippingAddress.city,
    postalCode: postalCode || order.shippingAddress.postalCode,
    country: country || order.shippingAddress.country,
  };

  const updatedOrder = await order.save();
  res.json(updatedOrder);
});

// @desc    Update estimated delivery date
// @route   PUT /api/orders/:id/estimated-delivery
// @access  Private/Employee
export const updateEstimatedDelivery = asyncHandler(async (req, res) => {
  const { estimatedDeliveryDate } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const newDate = new Date(estimatedDeliveryDate);
  
  // Validation: Early but not delay logic
  if (order.estimatedDeliveryDate) {
    const currentDate = new Date(order.estimatedDeliveryDate);
    if (newDate > currentDate) {
      return res.status(400).json({
        message: "Delivery date can be moved earlier but not delayed beyond the current estimate."
      });
    }
  }

  order.estimatedDeliveryDate = newDate;
  const updatedOrder = await order.save();
  res.json(updatedOrder);
});

