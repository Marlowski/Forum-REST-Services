const userService = require('../user/userService');
const jwt = require('jsonwebtoken');
const config = require('config');
const logger = require('../../config/winston');

//props: JSON body (contains User login data)
function createSessionToken(props, callback) {
    logger.debug("AuthenticationService: create token");

    if(!props) {
        logger.error("Error: have no JSON body");
        callback("JSON-Body missing", null, null);
        return;
    }

    // props is the given json body eg. JSON {} with user data -> see .http test file
    userService.findUserByUsername(props.username, function (error, user) {
        if(user) {
            logger.debug('Found user, check password');
            user.comparePassword(props.password, function (err, isMatch) {
               if(!isMatch) {
                   logger.error('invalid password!');
                   callback(err, null);
               } else {
                   logger.debug("Password is correct, create token");

                   var issuedAt = new Date().getTime();
                   var expirationTime = config.get('session.timeout');
                   var expiresAt = issuedAt + (expirationTime * 1000);
                   var privateKey = config.get('session.tokenKey');
                   let token = jwt.sign({ "user": user.userID, "role": user.role }, privateKey, { expiresIn: expiresAt, algorithm: 'HS256' });

                   logger.debug("Token created: " + token);

                   callback(null, token, user);
               }
            });
        } else {
            logger.error("Session Services: Did not find user for userID: " + props.userID);
            callback("Did not find user", null);
        }
    });
}

module.exports = {
    createSessionToken
}