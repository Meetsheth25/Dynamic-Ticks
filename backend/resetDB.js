import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

// Configure DNS servers to resolve MongoDB Atlas SRV records reliably
dns.setServers(['8.8.8.8', '1.1.1.1']);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

import User from './modules/auth/auth.model.js';
import Product from './modules/product/product.model.js';
import Order from './modules/order/order.model.js';
import Employee from './modules/employee/employee.model.js';
import Review from './modules/review/review.model.js';
import Cart from './modules/cart/cart.model.js';
import Payment from './modules/payment/payment.model.js';

const resetDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    console.log('Wiping database collections...');
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await Employee.deleteMany();
    await Review.deleteMany();
    await Cart.deleteMany();
    await Payment.deleteMany();
    console.log('Data successfully destroyed!');

    console.log('Creating default Admin & Employee accounts...');

    const db = mongoose.connection.db;

    // Create default Admin User
    const adminUser = {
      _id: new mongoose.Types.ObjectId('6a44f54959aa7934a26dc917'),
      name: 'System Admin',
      email: 'mitsheth2@gmail.com',
      password: '$2b$10$9kOWxdKdMAd98SqaulBdKeXYLL965AMCrP1ZrD/Zr5qu3kq8OkhvO',
      isAdmin: true,
      orderHistory: [],
      isVerified: true,
      isBlocked: false,
      addresses: [],
      createdAt: new Date('2026-07-01T11:08:57.510Z'),
      updatedAt: new Date('2026-07-01T11:08:57.510Z'),
      __v: 0
    };

    // Create Manager
    const manager = {
      _id: new mongoose.Types.ObjectId('6a44f54959aa7934a26dc918'),
      name: 'Store Manager',
      email: 'manager@dynamicticks.com',
      password: '$2b$10$EUj/Oxb0PDdDKBmGnbawBeba94.ry4ChZ76u.pO9XFCnsH4nMsj5O',
      role: 'manager',
      isActive: true,
      createdAt: new Date('2026-07-01T11:08:57.607Z'),
      updatedAt: new Date('2026-07-01T11:08:57.607Z'),
      __v: 0
    };

    // Create Staff
    const staff = {
      _id: new mongoose.Types.ObjectId('6a44f54959aa7934a26dc919'),
      name: 'Store Staff',
      email: 'staff@dynamicticks.com',
      password: '$2b$10$L/3yqtrRcmEXTSGXSW/PfO9hZVP39j0bvJICl735rbo.x2GvaCthW',
      role: 'staff',
      isActive: true,
      createdAt: new Date('2026-07-01T11:08:57.697Z'),
      updatedAt: new Date('2026-07-01T11:08:57.697Z'),
      __v: 0
    };

    // Create Delivery Person
    const delivery = {
      _id: new mongoose.Types.ObjectId('6a44f54959aa7934a26dc91a'),
      name: 'Delivery Agent',
      email: 'delivery@dynamicticks.com',
      password: '$2b$10$dD6QKDL0S1LqIciHkAWxJeKVJbejWxLq/dCDVOBGQy.sN2FTDKmjS',
      role: 'delivery',
      isActive: true,
      createdAt: new Date('2026-07-01T11:08:57.788Z'),
      updatedAt: new Date('2026-07-01T11:08:57.788Z'),
      __v: 0
    };

    await db.collection('users').insertOne(adminUser);
    await db.collection('employees').insertOne(manager);
    await db.collection('employees').insertOne(staff);
    await db.collection('employees').insertOne(delivery);

    console.log('--- DEFAULT ACCOUNTS CREATED ---');
    console.log('1. Admin: mitsheth2@gmail.com | Pass: #SM_253147s.');
    console.log('2. Manager: manager@dynamicticks.com | Pass: password123');
    console.log('3. Staff: staff@dynamicticks.com | Pass: password123');
    console.log('4. Delivery: delivery@dynamicticks.com | Pass: password123');
    console.log('--------------------------------');

    console.log('Database reset complete!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

resetDB();
