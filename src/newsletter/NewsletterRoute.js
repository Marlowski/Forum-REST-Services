const express = require('express');
const router = express.Router();
const userRoles = require('../user/userRoles');
const ac = userRoles.AccesControlObj;
const newsletterService = require('./NewsletterService');
const utility = require('../utility/Utility');


router.post('/send', utility.isAuthenticated, function (req,res) {
    const permission = ac.can(req.userRole).createAny('newsletter');
    if (permission.granted) {
        if(!req.body.subject || !req.body.text) {
            res.status(400).send({message: "Missing information to send newsletter."});
        } else {
            newsletterService.sendNewsletter({ subject: req.body.subject, context: req.body.text },function (err) {
                if (err) {
                    res.send({message: err});
                } else {
                    res.send({message: "Newsletter send out succesfully!"});
                }
            });
        }
    } else {
        res.status(403).send({message: "You're not permitted to do that!"});
    }
});

router.get('/subscribe', utility.isAuthenticated, function (req, res) {
    const permission = ac.can(req.userRole).updateOwn('newsletter');
    if (permission.granted) {
        newsletterService.subscribe(req.userID, function (err) {
           if(err) {
               res.status(500).send({message: err});
           } else {
               res.send({message: "You will now receive the latest news via email"});
           }
        });
    } else {
        res.status(403).send({message: "You're not permitted to do that!"});
    }
});

router.get('/unsubscribe', utility.isAuthenticated, function (req, res) {
    const permission = ac.can(req.userRole).updateOwn('newsletter');
    if (permission.granted) {
        newsletterService.unsubscribe(req.userID, function (err) {
            if(err) {
                res.status(500).send({message: err});
            } else {
                res.send({message: "You will no longer receive the Campfire newsletter"});
            }
        });
    } else {
        res.status(403).send({message: "You're not permitted to do that!"});
    }
});

module.exports = router;