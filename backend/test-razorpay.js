import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const testRazorpay = async () => {
  console.log('Testing Razorpay with Key ID:', process.env.RAZORPAY_KEY_ID);

  const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const options = {
    amount: 50000, // 500 INR
    currency: "INR",
    receipt: "receipt_test_1",
  };

  try {
    const order = await instance.orders.create(options);
    console.log('Order created successfully:', order.id);
  } catch (error) {
    console.error('Razorpay Error Details:', error);
  }
};

testRazorpay();
