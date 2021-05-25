const mongoose = require('mongoose');
const mailService = require('../utility/MailService');
const userService = require('../user/userService');


const MessagesSchema = new mongoose.Schema({
        fromUserID: String,
        toUserID: String,
        toUserMail: String,
        subject: String,
        context: String,
        deleted: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    },
);

MessagesSchema.pre('save', function (next) {
    let messageData = this;

    if(messageData.isModified('deleted')) return next();

    if(messageData.toUserMail) {
        userService.findUserById(messageData.fromUserID, function (err, fromUserData) {
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
