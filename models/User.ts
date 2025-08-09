import mongoose, { Schema, Document } from 'mongoose';
import bcryptjs from 'bcryptjs';

export interface IUser extends Document {
  pin: string;
  role: string;
  isActive: boolean;
  expiryDate?: Date;
  username: string; // Added username field
  comparePin: (pin: string) => Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    pin: {
      type: String,
      required: [true, 'PIN is required'],
    },
    username: { // Added username field
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      minlength: [3, 'Username must be at least 3 characters long'],
      trim: true
    },
    role: {
      type: String,
      required: true,
      enum: ['user', 'admin', 'superadmin', 'subadmin', 'superuser'],
      default: 'user'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    expiryDate: {
      type: Date,
      required: false
    }
  },
  { timestamps: true }
);

// Hash the PIN before saving
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('pin')) {
    return next();
  }
  try {
    const salt = await bcryptjs.genSalt(
      Number(process.env.PIN_SALT_ROUNDS) || 10
    );
    this.pin = await bcryptjs.hash(this.pin, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare PIN
UserSchema.methods.comparePin = async function (pin: string): Promise<boolean> {
  // Add a check to ensure this.pin is defined
  if (!this.pin) {
    console.error('User PIN is undefined!');
    return false;
  }
  return bcryptjs.compare(pin, this.pin);
};

// Check if the model exists before creating it to prevent overwrite errors
const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;