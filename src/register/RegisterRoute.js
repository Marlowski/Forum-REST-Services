const express = require('express');
const router = express.Router();
const logger = require('../../config/winston');
const registerService = require('./RegisterService');


router.post('/',function (req, res, next) {
    if(!req.body.username || !req.body.password || !req.body.email) {
        logger.error('missing register data');
        res.status(400).send({message: 'please provide all necessary information in order to register!'});
    } else {
        if(req.body.username === "[deleted]") {
            logger.error("username '[deleted]' is forbidden");
            res.status(406).send({message: "This username is not allowed!"});
        } else {
            registerService.registerUser(req.body, 'registered', function (err) {
                if(err) {
                    res.status(400).send({message: err});
                } else {
                    res.send({message: "You registered successfully! Check your mail to verify your account."});
                }
            });
        }
    }
});

router.get('/verify', function (req, res,next) {
    registerService.verifyUser(req.query.mailtoken, function (err) {
        if(err) {
            res.status(400).send({message: err});
        } else {
            res.send({message: 'Your account is now verified, please relog so all changes take place'});
        }
    });
});

module.exports = router;