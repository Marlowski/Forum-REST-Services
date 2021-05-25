const mongoose = require('mongoose');
const logger = require('../../config/winston');

//expiration doesnt work properly yet, expires after ca. 1 min
const ForumSchema = new mongoose.Schema({
    forumName: { type: String, unique: true },
    defaultForum: { type: Boolean, default: undefined }
});

ForumSchema.pre('save', function (next) {
    let forumData = this;
    if(forumData.defaultForum === undefined) {
        forumData.constructor.countDocuments({}, function (err, count) {
            if(err) {
                next(err);
            } else {
                if(count < 4) {
                    forumData.defaultForum = true;
                    next();
                } else {
                    forumData.defaultForum = false;
                    next();
                }
            }
        });
    } else {
        next();
    }
});

module.exports.Forum = mongoose.model('forums', ForumSchema, 'forums');
