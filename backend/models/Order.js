import mongoose from 'mongoose';

const orderSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderItems: [
    {
      name: { type: String, required: true },
      qty: { type: Number, required: true },
      image: { type: String, required: true },
      price: { type: Number, required: true },
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      customDesign: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomDesign' }
    }
  ],
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  paymentMethod: { type: String, required: true, default: 'Credit Card' },
  itemsPrice: { type: Number, required: true, default: 0.0 },
  shippingPrice: { type: Number, required: true, default: 0.0 },
  totalPrice: { type: Number, required: true, default: 0.0 },
  isPaid: { type: Boolean, required: true, default: true },
  paidAt: { type: Date },
  deliveredAt: { type: Date },
  status: { type: String, required: true, default: 'processing', enum: ['processing', 'shipped', 'delivered', 'cancelled', 'completed', 'return_requested', 'returned'] },
  returnRequest: {
    returnType: { type: String },
    reason: { type: String },
    description: { type: String },
    status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
    adminDecision: { type: String, enum: ['refund', 'exchange', null], default: null }
  },
  refundStatus: { 
    type: String, 
    enum: ['none', 'processing', 'refunded'], 
    default: 'none' 
  },
  assignedDeliveryPerson: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
  handledByStaff: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
  deliveryStatus: {
    type: String,
    enum: ['pending', 'picked', 'out_for_delivery', 'delivered'],
    default: 'pending'
  },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;
