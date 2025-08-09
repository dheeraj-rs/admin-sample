import mongoose from 'mongoose';

const SnippetSchema = new mongoose.Schema({
    id: String,
    name: String,
    type: String,
    snippet: String,
    language: String,
    version: String,
    props: mongoose.Schema.Types.Mixed,
}, { _id: false });

const ItemSchema = new mongoose.Schema(
    {
        id: String,
        name: String,
        description: String,
        longDescription: String,
        websiteType: String,
        publishedUrl: String,
        paymentType: String,
        paymentAmount: Number,
        author: String,
        version: String,
        support: String,
        thumbnail: String,
        screenshots: [String],
        features: [String],
        technologies: [String],
        viewsCount: Number,
        likesCount: Number,
        rating: Number,
        downloadCount: Number,
        snippet: [SnippetSchema],
    },
    {
        timestamps: true,
    }
);

const SnippetWebsite =
    mongoose.models.SnippetWebsite || mongoose.model('SnippetWebsite', ItemSchema);

export default SnippetWebsite;
