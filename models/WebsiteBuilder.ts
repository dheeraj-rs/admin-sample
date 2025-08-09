import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema(
    {
        id: String,
        name: String,
        websiteType: String,
        paymentType: String,
        paymentAmount: Number,
        publishedUrl: String,
        author: String,
        version: String,
        support: String,
        thumbnail: String,
        screenshots: [String],
        features: [String],
        technologies: [String],
        description: String,
        longDescription: String,
        viewsCount: Number,
        likesCount: Number,
        rating: Number,
        downloadCount: Number,
        snippet: [{
            id: String,
            name: String,
            type: String,
            snippet: String,
            language: String,
            version: String,
            props: mongoose.Schema.Types.Mixed
        }],
    },
    {
        timestamps: true,
    }
);

const WebsiteBuilder = mongoose.models.WebsiteBuilder || mongoose.model('WebsiteBuilder', ItemSchema);

export default WebsiteBuilder;
