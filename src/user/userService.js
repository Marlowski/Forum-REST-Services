const UserImport = require('./userModel');
const User = UserImport.User;
const config = require('config');
const logger = require('../../config/winston');
const userRoles = require('./userRoles');
const ac = userRoles.AccesControlObj;

function getUsers(callback) {
    User.find()
        .select('userID username email role newsletter createdAt')
        .exec(function (err, users) {
            if(err || !users) {
                logger.error("Error during user list query");
                return callback("Error during user list query", null)
            }
            else {
                logger.debug("User list queryed successfully!");
                return callback(null, users);
            }
        });
}

function findUsersByRole(roleName, callback) {
    User.find({ role: roleName })
        .select('role userID username')
        .exec(function (err, users) {
            if(err) {
                logger.debug('error during query for user with role: ' + roleName);
                return callback('error during query for user with role:' + roleName, null);
            } else if(!users || (users && users.length === 0)) {
                logger.debug('Couldnt find users with role: ' + roleName);
                return callback(null, users);
            } else {
                logger.debug('Found users with role: ' + roleName);
                return callback(null, users);
            }
        });
}

function findUserByMail(mail, callback) {
    User.findOne({ email : mail })
        .select('userID username email role')
        .exec(function (err, user) {
           if(err || !user) {
               logger.debug('couldnt query for user by email');
               return callback("couldnt query for user by email", null);
           } else {
               logger.debug('Found user while querying for email');
               return callback(null, user);
           }
        });
}

function findUserByUsername(username, callback) {
    User.findOne({ username : username })
        .exec(function (err, user) {
            if(err || !user) {
                logger.debug('couldnt query for user by username');
                return callback("couldnt query for user by username", null);
            } else {
                logger.debug('Found user while querying for username');
                return callback(null, user);
            }
        });
}

function findUserById(searchUserID, callback) {
    if(!searchUserID) {
        logger.error("UserID is missing");
        return callback("UserId is missing", null);
    } else {
        //query user
        var query = User.findOne({ userID: searchUserID });
        query.exec(function (err, user) {
            //Error while looking for user, return callback with error
            if(err || !user) {
                logger.error("Error while looking for userID " +searchUserID);
                return callback("Error while looking for userID " +searchUserID);
            } else {
                //user exists return callback with user-value
                if(user) {
                    logger.debug('Found userID: ' + searchUserID);
                    callback(null, user);
                } else {
                    //no users found
                    logger.error("Did not find user for userID " + searchUserID);
                    callback(err, null);
                }
            }
        });
    }

}

function createAdminUser(callback) {
    let adminUser = new User();

    //default pw: "password"
    let adminData = config.get('defaultAdmin');
    adminUser.userID = adminData.userID;
    adminUser.password = adminData.password;
    adminUser.username = adminData.username;
    adminUser.email = adminData.email;
    adminUser.newsletter = adminData.newsletter;
    adminUser.role = "admin";

    adminUser.save(function (err) {
        if(err) {
            logger.error("Could not create default admin account");
            callback("Could not create default admin account", null);
        } else {
            callback(null, adminUser.userID);
        }
    });
}

function generateId(callback) {
    User.find()
        .sort({userID:-1}).limit(1)
        .exec(function (err, id) {
            if(err) {
                logger.debug('couldnt query for biggest userID');
                return callback(err, null);
            } else if(!id || (id && id.length === 0)) {
                logger.debug('first entry in database');
                //starting with to reserve 1 for potential default admin
                return callback(null, 2);
            } else {
                logger.debug('Found user/s with biggest userID');
                return callback(null, parseInt(id[0].userID)+1);
            }
        });
}

function createUser(data, userRole, callback) {
    //check if email or username already exists
    findUserByMail(data.email, function (err, user) {
        if(user) {
            return callback('An account with this email already exists!', null);
        } else {
            findUserByUsername(data.username, function (err, user) {
               if(user) {
                   return callback('An account with this username already exists!', null);
               } else {
                   //generate next highest id number
                   generateId(function (err, id) {
                       if(err) {
                           return callback(err, null);
                       } else {
                           let user = new User();
                           user.userID = id;
                           user.username = data.username;
                           user.email = data.email;
                           user.password = data.password;
                           user.role = userRole;
                           user.save(function (err) {
                               if(err) {
                                   logger.error("Could not create registered account");
                                   return callback("Could not create registered account", null);
                               } else {
                                   logger.debug("Account registered");
                                   return callback(null, id);
                               }
                           });
                       }
                   });
               }
            });
        }
    });
}

function changePassword(userID, newPassword, callback) {
    this.findUserById(userID, function (err, user) {
        if(err) {
            return callback(err);
        } else {
            user.password = newPassword;
            user.save(function (err) {
                if(err) {
                    return callback(err);
                } else {
                    logger.debug('password changed successfully');
                    return callback(null);
                }
            });
        }
    });
}

function deleteAccount(deleteId, role, id, callback) {
    //check permission level - if not admin compare usernames if they're the same
    const pms = ac.can(role).deleteAny('account');
    if(!pms.granted) {
        if(id !== deleteId) {
            return callback({msg: "You're not allowed to delete accounts of others", status: 403});
        }
    }
    //mongoose doesnt throw an error if non existing-userid is passed so check for returned result
    User.findOneAndDelete({ userID: deleteId }, function (err, result) {
        if(err || !result) {
            logger.error("error during account deletion");
            callback({msg: "An error occured while trying to delete an account with the userID: " + deleteId, status: 500});
        } else {
            logger.info("account deleted successfully");
            callback(null);
        }
    });
}

module.exports = {
    getUsers,
    findUserById,
    createAdminUser,
    findUsersByRole,
    changePassword,
    findUserByMail,
    findUserByUsername,
    createUser,
    deleteAccount
}