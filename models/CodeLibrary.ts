import mongoose, { Schema, Document } from 'mongoose';

export interface ISnippet {
  language: string;
  version: string;
  code: string;
}

export interface ICodeLibrary extends Document {
  elementId: string;
  title: string;
  description: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  likes: number;
  snippets: ISnippet[];
  hashtags: string[];
  componentType: string;
  complexity: 'beginner' | 'intermediate' | 'advanced';
}

const CodeLibrarySchema: Schema = new Schema(
  {
    elementId: {
      type: String,
      required: true,
      unique: true
    },
    title: {
      type: String,
      required: true,
      index: true
    },
    description: {
      type: String,
      required: true
    },
    author: {
      type: String,
      required: true
    },
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    snippets: [{
      language: {
        type: String,
        required: true
      },
      version: {
        type: String,
        required: true
      },
      code: {
        type: String,
        required: true
      }
    }],
    hashtags: [{
      type: String,
      index: true
    }],
    componentType: {
      type: String,
      required: true,
      index: true
    },
    complexity: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Create indexes for search
CodeLibrarySchema.index({ title: 'text', description: 'text', hashtags: 'text' });

const CodeLibrary = mongoose.models.CodeLibrary || mongoose.model<ICodeLibrary>('CodeLibrary', CodeLibrarySchema);

export default CodeLibrary;