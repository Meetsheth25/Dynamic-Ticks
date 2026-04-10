import asyncHandler from 'express-async-handler';
import Employee from '../models/Employee.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import jwt from 'jsonwebtoken';

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });

// ─── AUTH ────────────────────────────────────────────────────────────────────

// @desc   Employee Login
// @route  POST /api/employees/login
// @access Public
export const loginEmployee = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const normalizedEmail = email.toLowerCase().trim();
  const employee = await Employee.findOne({ email: normalizedEmail });

  if (!employee) {
    res.status(404);
    throw new Error('User not found. Please register first.');
  }

  if (!employee.isActive) {
    res.status(403);
    throw new Error('Account disabled');
  }

  const isMatch = await employee.matchPassword(password);

  if (!isMatch) {
    res.status(401);
    throw new Error("Incorrect password. Click 'Forgot Password' to reset.");
  }

  res.json({
    _id: employee._id,
    name: employee.name,
    email: employee.email,
    role: employee.role,
    isActive: employee.isActive,
    token: generateToken(employee._id, employee.role),
  });
});


// ─── ADMIN CRUD ──────────────────────────────────────────────────────────────

// @desc   Get all employees
// @route  GET /api/employees
// @access Private/Admin
export const getEmployees = asyncHandler(async (req, res) => {
  const employees = await Employee.find({}).select('-password');
  res.json(employees);
});

// @desc   Create employee
// @route  POST /api/employees
// @access Private/Admin
export const createEmployee = asyncHandler(async (req, res) => {
  const { name, password, role } = req.body;
  const email = (req.body.email || '').toLowerCase().trim();

  if (!name || !email || !password || !role) {
    res.status(400);
    throw new Error('name, email, password and role are all required');
  }

  const exists = await Employee.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error('Employee with this email already exists');
  }

  const employee = await Employee.create({ name, email, password, role });
  console.log('EMPLOYEE CREATED:', employee.name, '| role:', employee.role, '| passwordHashed:', employee.password.startsWith('$2'));
  res.status(201).json({
    _id: employee._id,
    name: employee.name,
    email: employee.email,
    role: employee.role,
    isActive: employee.isActive,
  });

});

// @desc   Update employee
// @route  PUT /api/employees/:id
// @access Private/Admin
export const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }

  employee.name = req.body.name || employee.name;
  employee.email = req.body.email || employee.email;
  employee.role = req.body.role || employee.role;
  if (typeof req.body.isActive !== 'undefined') employee.isActive = req.body.isActive;
  if (req.body.password) employee.password = req.body.password;

  const updated = await employee.save();
  res.json({
    _id: updated._id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
    isActive: updated.isActive,
  });
});

// @desc   Delete employee
// @route  DELETE /api/employees/:id
// @access Private/Admin
export const deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }
  await employee.deleteOne();
  res.json({ message: 'Employee removed' });
});

// ─── MANAGER ACTIONS ─────────────────────────────────────────────────────────

// @desc   Get all return requests (Manager)
// @route  GET /api/employees/manager/returns
// @access Private/Manager
export const getManagerReturns = asyncHandler(async (req, res) => {
  const orders = await Order.find({ status: 'return_requested' })
    .populate('userId', 'name email')
    .populate('orderItems.product', 'name price')
    .sort({ createdAt: -1 });
  res.json(orders);
});

// @desc   Approve return (Manager)
// @route  PUT /api/employees/manager/returns/:id/approve
// @access Private/Manager
export const managerApproveReturn = asyncHandler(async (req, res) => {
  const { adminDecision } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order || !order.returnRequest) {
    res.status(404);
    throw new Error('Order/return not found');
  }

  order.returnRequest.status = 'approved';
  order.returnRequest.adminDecision = adminDecision;

  if (adminDecision === 'refund') {
    order.status = 'returned';
    order.refundStatus = 'processing';
    setTimeout(async () => {
      try {
        const o = await Order.findById(order._id);
        if (o && o.refundStatus === 'processing') {
          o.refundStatus = 'refunded';
          await o.save();
        }
      } catch (e) { console.error('Refund timer:', e); }
    }, 30 * 60 * 1000);
  } else if (adminDecision === 'exchange') {
    order.status = 'exchange_in_progress';
  }

  const updated = await order.save();
  res.json(updated);
});

// @desc   Reject return (Manager)
// @route  PUT /api/employees/manager/returns/:id/reject
// @access Private/Manager
export const managerRejectReturn = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order || !order.returnRequest) {
    res.status(404);
    throw new Error('Order/return not found');
  }
  order.status = 'delivered';
  order.returnRequest.status = 'rejected';
  const updated = await order.save();
  res.json(updated);
});

// @desc   Manager get all products
// @route  GET /api/employees/manager/products
// @access Private/Manager
export const managerGetProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({});
  res.json(products);
});

// @desc   Manager create product
// @route  POST /api/employees/manager/products
// @access Private/Manager
export const managerCreateProduct = asyncHandler(async (req, res) => {
  const { name, price, category, description, countInStock, returnAvailable, returnDays, returnHours } = req.body;
  const imagePaths = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

  const product = new Product({
    name, price: Number(price), category,
    images: imagePaths,
    description: description || '',
    countInStock: Number(countInStock) || 0,
    returnAvailable: returnAvailable === 'true' || returnAvailable === true,
    returnDays: Number(returnDays) || 0,
    returnHours: Number(returnHours) || 0,
  });

  const created = await product.save();
  res.status(201).json(created);
});

// @desc   Manager update product (stock + details)
// @route  PUT /api/employees/manager/products/:id
// @access Private/Manager
export const managerUpdateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const { name, price, category, description, countInStock, returnAvailable, returnDays, returnHours } = req.body;
  product.name = name || product.name;
  product.price = price !== undefined ? Number(price) : product.price;
  product.category = category || product.category;
  product.description = description || product.description;
  product.countInStock = countInStock !== undefined ? Number(countInStock) : product.countInStock;
  product.returnAvailable = returnAvailable !== undefined ? (returnAvailable === 'true' || returnAvailable === true) : product.returnAvailable;
  product.returnDays = returnDays !== undefined ? Number(returnDays) : product.returnDays;
  product.returnHours = returnHours !== undefined ? Number(returnHours) : product.returnHours;
  if (req.files && req.files.length > 0) product.images = req.files.map(f => `/uploads/${f.filename}`);

  const updated = await product.save();
  res.json(updated);
});

// @desc   Manager delete product
// @route  DELETE /api/employees/manager/products/:id
// @access Private/Manager
export const managerDeleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  await product.deleteOne();
  res.json({ message: 'Product removed' });
});

// ─── STAFF ACTIONS ───────────────────────────────────────────────────────────

// @desc   Staff get all orders
// @route  GET /api/employees/staff/orders
// @access Private/Staff
export const staffGetOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate('userId', 'name email')
    .populate('orderItems.product', 'name price')
    .populate('assignedDeliveryPerson', 'name email')
    .sort({ createdAt: -1 });
  res.json(orders);
});

// @desc   Staff update order status + assign delivery
// @route  PUT /api/employees/staff/orders/:id
// @access Private/Staff
export const staffUpdateOrder = asyncHandler(async (req, res) => {
  const { status, assignedDeliveryPerson } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (status) {
    order.status = status;
    if (status === 'delivered') {
      order.deliveredAt = Date.now();
      order.isPaid = true;
    }
    // When shipped/dispatched – reduce stock by 1 per item
    if (status === 'shipped') {
      order.handledByStaff = req.user._id;
      for (const item of order.orderItems) {
        if (item.product) {
          await Product.findByIdAndUpdate(item.product, { $inc: { countInStock: -item.qty } });
        }
      }
    }
  }

  if (assignedDeliveryPerson) {
    if (order.assignedDeliveryPerson) {
      res.status(400);
      throw new Error('Delivery person already assigned and cannot be changed.');
    }
    order.assignedDeliveryPerson = assignedDeliveryPerson;
  }

  const updated = await order.save();
  res.json(updated);
});

// @desc   Staff get delivery persons with active counts
// @route  GET /api/employees/staff/delivery-persons
// @access Private/Staff
export const getDeliveryPersons = asyncHandler(async (req, res) => {
  const persons = await Employee.find({ role: 'delivery', isActive: true }).select('-password').lean();
  
  // Attach active counts
  const personsWithCounts = await Promise.all(persons.map(async (person) => {
    const activeDeliveries = await Order.countDocuments({
      assignedDeliveryPerson: person._id,
      deliveryStatus: { $ne: 'delivered' }
    });
    return { ...person, activeDeliveries };
  }));

  res.json(personsWithCounts);
});

// ─── DELIVERY ACTIONS ────────────────────────────────────────────────────────

// @desc   Delivery person get assigned orders
// @route  GET /api/employees/delivery/orders
// @access Private/Delivery
export const deliveryGetOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ assignedDeliveryPerson: req.user._id })
    .populate('userId', 'name email')
    .populate('orderItems.product', 'name')
    .sort({ createdAt: -1 });
  res.json(orders);
});

// @desc   Delivery person update delivery status
// @route  PUT /api/employees/delivery/orders/:id
// @access Private/Delivery
export const deliveryUpdateStatus = asyncHandler(async (req, res) => {
  const { deliveryStatus } = req.body;
  const allowed = ['picked', 'out_for_delivery', 'delivered'];

  if (!allowed.includes(deliveryStatus)) {
    res.status(400);
    throw new Error('Invalid delivery status');
  }

  const order = await Order.findOne({ _id: req.params.id, assignedDeliveryPerson: req.user._id });
  if (!order) {
    res.status(404);
    throw new Error('Order not found or not assigned to you');
  }

  order.deliveryStatus = deliveryStatus;
  if (deliveryStatus === 'delivered') {
    order.status = 'delivered';
    order.deliveredAt = Date.now();
    order.isPaid = true;
  }

  const updated = await order.save();
  res.json(updated);
});
