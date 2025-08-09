import mongoose, { Schema, Document } from 'mongoose';

// Define the option item structure
export interface IOptionItem {
  label: string;
  value: string;
}

// Define the filter option document interface
export interface IFilterOption extends Document {
  type: 'category' | 'type' | 'technology';
  options: IOptionItem[];
  createdAt: Date;
  updatedAt: Date;
}

// Define a type for the lean document (what's returned when using .lean())
export interface FilterOptionLean {
  _id: mongoose.Types.ObjectId;
  type: 'category' | 'type' | 'technology';
  options: IOptionItem[];
  createdAt: Date;
  updatedAt: Date;
  __v?: number;
}

const FilterOptionSchema: Schema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['category', 'type', 'technology'],
      unique: true
    },
    options: [{
      label: String,
      value: String
    }],
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Create or use the model
const FilterOption = mongoose.models.FilterOption || 
  mongoose.model<IFilterOption>('FilterOption', FilterOptionSchema);

export default FilterOption;