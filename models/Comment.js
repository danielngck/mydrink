const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    coName: { type: String, required: true },
    coEmail: { type: String, required: true },
    coPhone: { type: Number, required: true },
    coMessage: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
}, { versionKey: false, collection: 'comment' });

module.exports = mongoose.model('Comment', commentSchema);