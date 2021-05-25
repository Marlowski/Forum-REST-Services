const logger = require('../../config/winston');
const userService = require('../user/userService');
const mailService = require('../utility/MailService');


function sendNewsletter(data, callback) {
    userService.getUsers(function (err, users) {
       if(err) {
           return callback(err);
       } else {
           for(const user of users) {
                if(user.newsletter && user.email) {
                    mailService.sendNewsletter(user.email, data, function(err) {
                        if(err) {
                            logger.error("An error occurred during the newsletter sending process");
                            return;
                        } else {
                            return;
                        }
                    });
                }
           }
           logger.info("Newsletter sending process finished successfully!");
           return callback(null)
       }
    });
}

function subscribe(userId, callback) {
    userService.findUserById(userId, function (err, user) {
       if(err) {
           return callback(err);
       } else {
           if(!user.email) {
               logger.error("email should be avialable but isnt");
               return callback("There is no email set for this account");
           } else if(user.newsletter) {
               logger.error("already subscribed");
               return callback("You're already subscribed to the newsletter");
           }
           user.newsletter = true;
           user.save(function (err) {
               if(err) {
                   return callback(err);
               } else {
                   logger.debug(user.username + " subscribed to newsletter");
                   return callback(null);
               }
           });
       }
    });
}

function unsubscribe(userId, callback) {
    userService.findUserById(userId, function (err, user) {
        if(err) {
            return callback(err);
        } else {
            if(!user.email) {
                logger.error("email should be avialable but isnt");
                return callback("There is no email set for this account");
            } else if(!user.newsletter) {
                logger.error("Account weren't subscribed in the first place");
                return callback("You arent subscribed to the newsletter!");
            }
            user.newsletter = false;
            user.save(function (err) {
                if(err) {
                    return callback(err);
                } else {
                    logger.debug(user.username + " unsubscribed to newsletter");
                    return callback(null);
                }
            });
        }
    });
}

module.exports = {
    sendNewsletter,
    subscribe,
    unsubscribe
}
