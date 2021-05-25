const express = require('express');
const router = express.Router();
const logger = require('../../config/winston');
const registerService = require('./RegisterService');


router.post('/',function (req, res, next) {
    if(!req.body.username || !req.body.password || !req.body.email) {
        logger.error('missing register data');
        res.status(400).send('please provide all necessary information in order to register!');
    } else {
        registerService.registerUser(req.body, 'registered', function (err) {
            if(err) {
                res.status(400).send(err);
            } else {
                res.send("user registered.");
            }
        });
    }
});

router.get('/verify', function (req, res,next) {
    registerService.verifyUser(req.query.mailtoken, function (err) {
        if(err) {
            res.status(400).send(err);
        } else {
            res.send('Your account is now verified, please relog so all changes take place');
        }
    });
});

module.exports = router;