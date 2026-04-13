import mongoose from 'mongoose';

const productSchema = mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  targetAudience: { type: String, enum: ['Men', 'Women', 'Boys', 'Girls', 'Unisex'], default: 'Unisex' },
  colorVariants: [{
    name:         { type: String, required: true },
    hex:          { type: String, default: '#000000' },
    images:       [{ type: String }],
    countInStock: { type: Number, default: 0 }
  }],
  images: [{ type: String }],
  description: { type: String, required: true },
  rating: { type: Number, required: true, default: 0 },
  reviews: { type: Number, required: true, default: 0 },
  material: { type: String },
  caseDiameter: { type: String },
  bandMaterial: { type: String },
  movementType: { type: String },
  itemWeight: { type: String },
  countryOfOrigin: { type: String, default: 'Hong Kong' },
  countInStock: { type: Number, required: true, default: 0 },
  returnAvailable: { type: Boolean, default: false },
  returnDays: { type: Number, default: 0 },
  returnHours: { type: Number, default: 0 }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;
