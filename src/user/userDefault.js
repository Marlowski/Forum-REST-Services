const userService = require('./userService');
const logger = require('../../config/winston');

function checkForDefaultAdmin(callback) {
    userService.findUsersByRole('admin', function (err, user) {
        //error during query
        if(err) {
            logger.error("userDefault Error: a problem occurred by trying to find an admin user");
            callback(err, null);
            //no error -> user found : no need to create admin acc
        } else {
            if(user && user.length > 0) {
                callback(user.length + " admin account/s already exist!", null);
            } else {
                userService.createAdminUser(function (err, AdminUserID) {
                    if(err) {
                        callback("userDefault Error: couldnt created new admin user!", null);
                    } else {
                        callback(null, "created admin account with userID: " + AdminUserID);
                    }
                });
            }
        }
    });
}



module.exports = {
    checkForDefaultAdmin
}


