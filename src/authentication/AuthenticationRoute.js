const express = require('express');
const router = express.Router();
const logger = require('../../config/winston');

const utility = require('../utility/Utility');
const authenticationService = require('./AuthenticationService');

//post instead of get, because JSON content is parsed
router.post('/login',function (req, res, next) {

    //check and decode passed login credentials
    utility.decodeCredentials(req, function (err, userData) {
        if(err) {
            logger.error("no credentials were passed");
            res.statusCode = 401;
            res.setHeader('WWW-Authenticate','Basic realm="Secure Area"');
            return res.json({ message:'Missing Auth. Header - please pass data!'});
        }

    //create token for user
    logger.debug('Try to create token');
    authenticationService.createSessionToken(userData, function (err, token, user) {
        if(token) {
            res.header("Authorization", "Bearer " + token);
            if(user) {
                const { id, userID, username, ...partialObject } = user;
                const subset = { id, userID, username };
                logger.debug(JSON.stringify(subset));
                res.send(subset);
            } else {
                logger.error("User is null, even though a token has been created. Error: " + err);
                res.send('Created token, but user is null');
            }
        } else {
            logger.error("Token has not been created, Error: " + err);
            res.send('Could not create token');
        }
    });
});

});

module.exports = router;

