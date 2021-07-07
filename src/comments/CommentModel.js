const mongoose = require('mongoose');

//expiration doesnt work properly yet, expires after ca. 1 min
const CommentSchema = new mongoose.Schema({
    commentCreatedByUserID: String,
    commentCreatedByUsername: String,
    commentOnPostID: String,
    content: String,
    createdAt: { type: Date, default: Date.now },
    edited: { type: Boolean, default: false }
});

module.exports.Comment = mongoose.model('comments', CommentSchema, 'comments');