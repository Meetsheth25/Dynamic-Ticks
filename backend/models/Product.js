import mongoose from 'mongoose';

const productSchema = mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  images: [{ type: String }],
  description: { type: String, required: true },
  rating: { type: Number, required: true, default: 0 },
  reviews: { type: Number, required: true, default: 0 },
  material: { type: String },
  countInStock: { type: Number, required: true, default: 0 },
  returnAvailable: { type: Boolean, default: false },
  returnDays: { type: Number, default: 0 },
  returnHours: { type: Number, default: 0 }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;
