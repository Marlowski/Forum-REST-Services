const MessageModelSchema = require('./MessagesModel');
const MessageModel = MessageModelSchema.MessagesSchema;
const userService = require('../user/userService');
const logger = require('../../config/winston');


function getMessages(userId, callback) {
    MessageModel.find({ toUserID: userId, deleted: false })
        .select('-deleted')
        .exec(function (err, messages) {
           if(err || !messages) {
               logger.error('error during message query');
               return callback("An error occurred while trying to fetch your messages", null);
           } else if(messages && messages.length === 0) {
               logger.info("no messages found");
               return callback("No messages found")
           } else {
               logger.info("found " + messages.length + " message/s sent to userId: " + userId);
               return callback(null, messages);
           }
        });
}

function getSendMessages(userId, callback) {
    MessageModel.find({ fromUserID: userId })
        .select('-deleted')
        .exec(function (err, messages) {
            if(err || !messages) {
                logger.error('error during message query');
                return callback("An error occurred while trying to fetch your sent messages", null);
            } else if(messages && messages.length === 0) {
                logger.info("no sent messages found");
                return callback("No sent messages found")
            } else {
                logger.info("found " + messages.length + " sent message/s from userId: " + userId);
                return callback(null, messages);
            }
        });
}

function readMessage(objectId, callback) {
    MessageModel.findOne({ _id: objectId})
        .exec(function (err, message) {
           if(err || !message) {
               logger.error("problem while querying for message _id: " + objectId);
               return callback("An error occurred while trying to find the message", null);
           } else {
               logger.debug("message with id: " + objectId + " found");
               return callback(null, message);
           }
        });
}

function writeMessage(fromId, toUsername, subject, text, callback) {
    userService.findUserByUsername(toUsername, function (err, user) {
       if(err || !user) {
           return callback("couldnt find user to send message to");
       } else {
           let msg = new MessageModel();
           msg.fromUserID = fromId;
           msg.toUserID = user.userID;
           if(user.email) { msg.toUserMail = user.email; }
           msg.subject = subject;
           msg.context = text;

           msg.save(function (err) {
               if(err) {
                   logger.error("Could not send message");
                   return callback(err);
               } else {
                   logger.debug('message send!');
                   return callback(null);
               }
           });
       }
    });
}

function deleteMessage(objectId, userId, callback) {
    MessageModel.findOne({ _id: objectId})
        .exec(function (err, message) {
            if(err || !message) {
                logger.error("problem while querying for message _id: " + objectId);
                return callback("An error occurred while trying to find the message");
            } else {
                if(message.toUserID === userId ) {
                    if(message.deleted === true) {
                        logger.debug("trying to delete already deleted message");
                        return callback("no message found");
                    }
                    message.deleted = true;
                    message.save(function (err) {
                        if(err) {
                            return callback("couldnt delete message");
                        } else {
                            logger.debug("message deleted");
                            return callback(null);
                        }
                    })
                    callback(null)
                } else {
                    logger.error("tried to delete message from different user");
                    callback("Cant delete message from other users!");
                }
            }
        });
}

module.exports = {
    getMessages,
    getSendMessages,
    readMessage,
    writeMessage,
    deleteMessage
}