const mongoose = require('mongoose');
const mailService = require('../utility/MailService');
const userService = require('../user/userService');


const MessagesSchema = new mongoose.Schema({
        fromUser: String,
        fromUserID: String,
        toUser: String,
        toUserID: String,
        toUserMail: String,
        subject: String,
        context: String,
        read: { type: Boolean, default: false },
        deleted: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    },
);

MessagesSchema.pre('save', function (next) {
    let messageData = this;

    //only send mail when data is saved after it got created, not when updated with delete or read attr.
    if(messageData.isModified('deleted') || messageData.isModified('read')) return next();

    if(messageData.toUserMail) {
        userService.findUserByUsername(messageData.fromUser, function (err, fromUserData) {
            if(err) {
                next(err);
            } else {
                mailService.newMessageNotification({email: messageData.toUserMail, fromUsername: fromUserData.username, context: messageData.context }, function (err) {
                    if(err) {
                        next(err);
                    } else {
                        next();
                    }
                });
            }
        });
    } else {
        next();
    }
});

module.exports.MessagesSchema = mongoose.model('Messages', MessagesSchema, 'messages');
