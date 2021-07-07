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
            res.status(401).send({message: 'Missing login data!'});
        } else {
            //create token for user
            logger.debug('Try to create token');
            authenticationService.createSessionToken(userData, function (err, token, user) {
                if(token) {
                    res.header("Access-Control-Expose-Headers", "Authorization");
                    res.header("Authorization", "Bearer " + token);
                    if(user) {
                        const { id, userID, username, role, newsletter, ...partialObject } = user;
                        const subset = { id, userID, username, role, newsletter };
                        logger.debug(JSON.stringify(subset));
                        res.send({message: subset});
                    } else {
                        logger.error("User is null, even though a token has been created. Error: " + err);
                        res.send({message: 'Created token, but user is null'});
                    }
                } else {
                    logger.error("Token has not been created, Error: " + err);
                    res.status(401).send({message: 'Could not create token'});
                }
            });
        }
});

});

module.exports = router;

