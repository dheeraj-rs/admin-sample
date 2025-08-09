import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
    name: String,
    title: String,
    url: String,
    type: String,
    category: String,
    technologies: [String],
    framework: String,
    price: Number,
    image: String,
    description: String,
    rating: Number,
    downloads: Number,
    features: [String],
    screenshots: [String],
    longDescription: String,
    techStack: [String],
    version: String,
    author: String,
    support: String,
    fileSize: String,
    timeToComplete: String,
    estimatedTime: String,
}, {
  timestamps: true
});


const Websites = mongoose.models.websites || mongoose.model('websites', ItemSchema);

export default Websites;