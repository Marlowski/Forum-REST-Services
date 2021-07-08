const UserImport = require('./RegisterModel');
const RegUser = UserImport.RegUser;
const config = require('config');
const logger = require('../../config/winston');
const userService = require('../user/userService');
const rnd = require('randomstring');
const mailService = require('../utility/MailService');


function registerUser(data, role, callback) {
    //create user with 'registered' role
    userService.createUser(data, role, function (err, userID) {
        if(err) {
            return callback(err);
        } else {
            data.userID = userID;
            sendEmail(data, function (err) {
                if(err) {
                    return callback(err);
                } else {
                    return callback(null);
                }
            });
        }
    });
}

function createRegisterToken(userId, callback) {
    let token = rnd.generate(25);
    let user = new RegUser();
    user.userID = userId;
    user.validation = token;
    user.save(function (err) {
        if(err) {
            logger.error("Could not create email-verification-token");
            callback(err, null);
        } else {
            logger.debug('email-verification-token created: ' + token);
            callback(null, token);
        }
    });
}

function sendEmail(data, callback) {
    //create random token and save it with the userID inside the db
    //send mail with verification url to users email adress
    createRegisterToken(data.userID, function (err, token) {
        if(err) {
            return callback(err);
        } else {
            mailService.sendVerificationMail({email: data.email, username: data.username, token: token }, function (err) {
               if(err) {
                   return callback("couldnt send verification mail.");
               } else {
                   return callback(null);
               }
            });
        }
    });
}

function checkForToken(token, callback) {
    RegUser.findOne({ validation: token })
        .exec(function (err, data) {
           if(err || !data) {
               logger.error("couldnt find matching verification token");
               callback("couldnt find matching verification token", null);
           } else {
               logger.debug('verification token found');
               callback(null, data);
           }
        });
}

//check if the token from the url exists and if so, update the user role to 'user and remove the email-validation token
function verifyUser(token, callback) {
    checkForToken(token, function (err, userData) {
        if(err) {
            return callback(err);
        } else {
            userService.findUserById(userData.userID, function (err, user) {
               if(user.role === "user") {
                   return callback("This Account is already verified!");
               }
               user.role = "user";
                user.save(function (err) {
                    if(err) {
                        logger.error("couldnt find matching userID in users collection");
                        return callback("couldnt find matching userID in users collection");
                    } else {
                        logger.debug('user role changed successfully');
                        //delete token
                        RegUser.deleteMany({ userID: userData.userID })
                            .exec(function (err) {
                               if(err) {
                                   logger.error("couldnt delete token data");
                               } else {
                                   logger.info("token data deleted successfully");
                                   return callback(null);
                               }
                            });
                    }
                });
            });
        }
    });
}


module.exports = {
    registerUser,
    verifyUser,
    sendEmail
}