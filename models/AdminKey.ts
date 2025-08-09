import mongoose from 'mongoose';

const adminKeySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  key: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'superadmin', 'subadmin', 'superuser'],
    default: 'admin'
  },
  expiryDate: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Add method to check if key is valid
adminKeySchema.methods.isValid = function() {
  return this.isActive && new Date() < this.expiryDate;
};

const AdminKey = mongoose.models.AdminKey || mongoose.model('AdminKey', adminKeySchema);

export default AdminKey;