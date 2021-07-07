const mongoose = require('mongoose');

//expiration doesnt work properly yet, expires after ca. 1 min
const PostSchema = new mongoose.Schema({
    postTitle: String,
    forumID: String,
    createdAt: { type: Date, default: Date.now },
    postedByUserID: String,
    postedByUsername: String,
    content: String,
    edited: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false }
});

module.exports.Post = mongoose.model('posts', PostSchema, 'posts');