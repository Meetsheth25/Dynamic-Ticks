import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import Employee from './models/Employee.js';
import Review from './models/Review.js';
import Cart from './models/Cart.js';
import Payment from './models/Payment.js';

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

    // Create default Admin User
    const adminUser = new User({
      name: 'System Admin',
      email: 'admi@dynamicticks.com',
      password: 'password123',
      isAdmin: true,
      isVerified: true
    });

    // Create Manager
    const manager = new Employee({
      name: 'Store Manager',
      email: 'manager@dynamicticks.com',
      password: 'password123',
      role: 'manager'
    });

    // Create Staff
    const staff = new Employee({
      name: 'Store Staff',
      email: 'staff@dynamicticks.com',
      password: 'password123',
      role: 'staff'
    });

    // Create Delivery Person
    const delivery = new Employee({
      name: 'Delivery Agent',
      email: 'delivery@dynamicticks.com',
      password: 'password123',
      role: 'delivery'
    });

    await adminUser.save();
    await manager.save();
    await staff.save();
    await delivery.save();

    console.log('--- DEFAULT ACCOUNTS CREATED ---');
    console.log('1. Admin: admin@dynamicticks.com | Pass: password123');
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
