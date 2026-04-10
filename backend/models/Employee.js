import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const employeeSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['manager', 'staff', 'delivery'], default: 'staff' },
  isActive: { type: Boolean, default: true },
  otp: String,
  otpExpire: Date
}, { timestamps: true });

employeeSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

employeeSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;
