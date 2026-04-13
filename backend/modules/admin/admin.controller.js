import asyncHandler from 'express-async-handler';
import Order from '../order/order.model.js';
import User from '../auth/auth.model.js';

// @desc    Get admin analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getAnalytics = asyncHandler(async (req, res) => {
  const { timeRange } = req.query; // '7d', '30d', '12m'
  
  let dateLimit = new Date();
  if (timeRange === '7d') {
    dateLimit.setDate(dateLimit.getDate() - 7);
  } else if (timeRange === '30d') {
    dateLimit.setDate(dateLimit.getDate() - 30);
  } else if (timeRange === '12m') {
    dateLimit.setMonth(dateLimit.getMonth() - 12);
  } else {
    dateLimit.setDate(dateLimit.getDate() - 30); // Default to 30 days
  }

  // Get total stats (all time or filtered, but let's filter them by timeRange for the dashboard)
  const orders = await Order.find({ createdAt: { $gte: dateLimit } });
  
  const totalOrders = orders.length;
  const totalRevenue = orders.filter(o => o.isPaid).reduce((acc, order) => acc + order.totalPrice, 0);
  const totalReturns = orders.filter(o => o.status === 'returned').length;
  const totalCancelled = orders.filter(o => o.status === 'cancelled').length;

  // Aggregate by day (for the last 7d or 30d) or month (for 12m)
  let dateFormat = "%Y-%m-%d";
  if (timeRange === '12m') {
    dateFormat = "%Y-%m";
  }

  const dailyOrders = await Order.aggregate([
    { $match: { createdAt: { $gte: dateLimit } } },
    { $group: { _id: { $dateToString: { format: dateFormat, date: "$createdAt" } }, orders: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  const dailyRevenue = await Order.aggregate([
    { $match: { createdAt: { $gte: dateLimit }, isPaid: true } },
    { $group: { _id: { $dateToString: { format: dateFormat, date: "$createdAt" } }, revenue: { $sum: "$totalPrice" } } },
    { $sort: { _id: 1 } }
  ]);

  const returns = await Order.aggregate([
    { $match: { createdAt: { $gte: dateLimit }, status: 'returned' } },
    { $group: { _id: { $dateToString: { format: dateFormat, date: "$createdAt" } }, returns: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  const cancellations = await Order.aggregate([
    { $match: { createdAt: { $gte: dateLimit }, status: 'cancelled' } },
    { $group: { _id: { $dateToString: { format: dateFormat, date: "$createdAt" } }, cancellations: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  res.json({
    totalStats: {
      totalOrders,
      totalRevenue,
      totalReturns,
      totalCancelled
    },
    dailyOrders,
    dailyRevenue,
    returns,
    cancellations
  });
});

// @desc    Get users with stats
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsersWithStats = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').lean();
  
  const usersWithStats = await Promise.all(users.map(async (user) => {
    const totalOrders = await Order.countDocuments({ userId: user._id });
    const totalReturns = await Order.countDocuments({ userId: user._id, status: 'returned' });
    
    const userOrders = await Order.find({ userId: user._id, isPaid: true });
    const totalSpent = userOrders.reduce((acc, order) => acc + order.totalPrice, 0);
    
    return {
      ...user,
      totalOrders,
      totalReturns,
      totalSpent
    };
  }));

  res.json(usersWithStats);
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.isAdmin) {
      res.status(400);
      throw new Error('Cannot delete admin user');
    }
    await user.deleteOne();
    res.json({ message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Make user Admin
// @route   PUT /api/admin/users/:id/make-admin
// @access  Private/Admin
export const makeAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.isAdmin = true;
    const updatedUser = await user.save();
    res.json(updatedUser);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Remove Admin privileges
// @route   PUT /api/admin/users/:id/remove-admin
// @access  Private/Admin
export const removeAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.isAdmin = false;
    const updatedUser = await user.save();
    res.json(updatedUser);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Toggle User block status
// @route   PUT /api/admin/users/:id/block
// @access  Private/Admin
export const toggleUserBlock = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.isAdmin) {
      res.status(400);
      throw new Error('Cannot block an administrator');
    }
    user.isBlocked = !user.isBlocked;
    const updatedUser = await user.save();
    res.json(updatedUser);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get all return requests
// @route   GET /api/admin/returns
// @access  Private/Admin
export const getReturnRequests = asyncHandler(async (req, res) => {
  const orders = await Order.find({ status: 'return_requested' })
    .populate('userId', 'name email')
    .populate('orderItems.product', 'name price')
    .sort({ 'returnRequest.requestedAt': -1 });
    
  res.json(orders);
});

