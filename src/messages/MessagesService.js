const MessageModelSchema = require('./MessagesModel');
const MessageModel = MessageModelSchema.MessagesSchema;
const userService = require('../user/userService');
const logger = require('../../config/winston');


function getMessages(userId, callback) {
    userService.findUserById(userId, function (err, user) {
       if(err) {
           return callback(err);
       } else {
           MessageModel.find({ toUserID: user._id.toString(), deleted: false })
               .select('-deleted')
               .exec(function (err, messages) {
                   if(err || !messages) {
                       logger.error('error during message query');
                       return callback("An error occurred while trying to fetch your messages", null);
                   } else if(messages && messages.length === 0) {
                       logger.info("no messages found");
                       return callback(null, []);
                   } else {
                       logger.info("found " + messages.length + " message/s sent to userId: " + userId);
                       return callback(null, messages);
                   }
               });
       }
    });
}

function getSendMessages(userId, callback) {
    userService.findUserById(userId, function (err, user) {
        MessageModel.find({ fromUserID: user._id.toString() })
            .exec(function (err, messages) {
                if(err || !messages) {
                    logger.error('error during message query');
                    return callback("An error occurred while trying to fetch your sent messages", null);
                } else if(messages && messages.length === 0) {
                    logger.info("no sent messages found");
                    return callback(null, []);
                } else {
                    logger.info("found " + messages.length + " sent message/s from userId: " + userId);
                    return callback(null, messages);
                }
            });
    });
}

function readMessage(objectId, view, userId, callback) {
    MessageModel.findOne({ _id: objectId})
        .exec(function (err, message) {
           if(err || !message) {
               logger.error("problem while querying for message _id: " + objectId);
               return callback("An error occurred while trying to find the message", null);
           } else {
               if(!message.read && view !== "sent") {
                   message.read = true;
                   message.save(function (err) {
                       if(err) {
                           logger.error("error while trying to update message read-status");
                       }
                   });
               }
               logger.debug("message with id: " + objectId + " found");
               userService.findUserById(userId, function (err, user) {
                   if(err) {
                       return callback("couldnt validate that message was sent to user");
                   } else {
                       if(user._id.toString() === message.fromUserID || user._id.toString() === message.toUserID) {
                           logger.debug("message is from or to user - access granted");
                           return callback(null, message);
                       } else {
                           logger.debug("message is neither sent or received from user - access denied");
                           return callback("You're not permitted to read emails that either arent sent to you or written by you!");
                       }
                   }
               });
           }
        });
}

function hasUnreadMessage(userId, callback) {
    userService.findUserById(userId, function (err, user) {
        if(err) {
            logger.debug("error while querying for username in hasUnreadMessage");
            return callback(false);
        } else {
            MessageModel.find({toUserID: user._id})
                .exec(function (err, messages) {
                   if(err) {
                       logger.debug("error while querying for messages in hasUnreadMessage");
                       return callback(false);
                   } else {
                       let hasUnread = false;
                       for(let msg of messages) {
                           if(!msg.read) {
                               logger.debug("unread message detected!");
                               hasUnread = true;
                                break;
                           }
                       }
                       if(hasUnread) {
                           return callback(true);
                       } else {
                           logger.debug("no unread messages detected!");
                           return callback(false);
                       }
                   }
                });
        }
    });

}

function writeMessage(fromId, toUsername, subject, text, callback) {
    userService.findUserById(fromId, function (err, fromUser) {
        if(err) {
            return callback(err);
        } else {
            userService.findUserByUsername(toUsername, function (err, user) {
                if(err || !user) {
                    return callback("Cant send message to nonexisting user!");
                } else {
                    let msg = new MessageModel();
                    msg.fromUser = fromUser.username;
                    msg.fromUserID = fromUser._id.toString();
                    msg.toUser = user.username;
                    msg.toUserID = user._id.toString();
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
    });
}

function deleteMessage(objectId, userId, callback) {
    userService.findUserById(userId, function (err, user) {
        if(err) {
            return callback(err);
        } else {
            MessageModel.findOne({ _id: objectId})
                .exec(function (err, message) {
                    if(err || !message) {
                        logger.error("problem while querying for message _id: " + objectId);
                        return callback("An error occurred while trying to find the message");
                    } else {
                        if(message.toUserID === user._id.toString()) {
                            if(message.deleted === true) {
                                logger.debug("trying to delete already deleted message");
                                return callback("no message found");
                            }
                            message.deleted = true;
                            message.read = true;
                            message.save(function (err) {
                                if(err) {
                                    return callback("couldnt delete message");
                                } else {
                                    logger.debug("message deleted");
                                    return callback(null);
                                }
                            });
                        } else {
                            logger.error("tried to delete message from different user");
                            callback("Cant delete message from other users!");
                        }
                    }
                });
        }
    });
}

module.exports = {
    getMessages,
    getSendMessages,
    readMessage,
    writeMessage,
    deleteMessage,
    hasUnreadMessage
}