const express = require('express');
const router = express.Router();
const logger = require('../../config/winston');

const userService = require('./userService');
const utility = require('../utility/Utility');
const registerService = require('../register/RegisterService');

const userRoles = require('./userRoles');
const ac = userRoles.AccesControlObj;


router.get('/', utility.isAuthenticated ,function (req, res, next) {
    const permission = ac.can(req.userRole).readAny('account');
    if (permission.granted) {
        userService.getUsers(function (err, users) {
            if(err) {
                res.json({ message:'An error occurred while querying users'});
            } else if(users.length <= 0) {
                res.json({ message:'No users are defined yet!'});
            } else {
                res.json(users);
            }
        });
    } else {
        res.status(403).send("Access blocked!");
    }
});


router.post('/change-password', utility.isAuthenticated ,function (req, res, next) {
    //no userID was passed, change password of loged in account
    if(!req.body.password) {
        res.status(400).send("pls provide a new password");
    } else if(!req.body.userID) {
        userService.changePassword(req.userID, req.body.password,function (err) {
            if(err) {
                logger.error('Error during password change');
                res.send("Error during password change, pls try again!");
            } else {
                res.send("Password changed successfully!");
            }
        });
        //userID was passed, check if user is admin and is therefor permitted to change other acc. passwords
        // or if he passed his own id
    } else {
        const pms = ac.can(req.userRole).updateAny('account');
        if(pms.granted || (req.body.userID === req.userID)) {
            userService.changePassword(req.body.userID, req.body.password,function (err) {
                if(err) {
                    logger.error('Error during password change');
                    res.send("Error during password change, pls try again!");
                } else {
                    res.send("Password changed successfully!");
                }
            });
        } else {
            res.status(403).send("You're not permitted to do that!");
        }
    }
});

router.post('/profil', utility.isAuthenticated, function (req, res, next) {
    if(req.body.userID) {
        userService.findUserById(req.body.userID, function (err, user) {
            if(err || !user) {
                res.send('Couldnt find any matches!');
            } else {
                const { id, userID, username, email, role, ...partialObject } = user;
                const subset = { id, userID, username, email, role };
                logger.debug(JSON.stringify(subset));
                res.send(subset);
            }
        });
    } else if(req.body.username) {
        userService.findUserByUsername(req.body.username, function (err, user) {
            if(err || !user) {
                res.send('Couldnt find any matches!');
            } else {
                const { id, userID, username, email, role, ...partialObject } = user;
                const subset = { id, userID, username, email, role };
                logger.debug(JSON.stringify(subset));
                res.send(subset);
            }
        });
    } else if(req.body.email) {
        userService.findUserByMail(req.body.email, function (err, user) {
            if(err || !user) {
                res.send('Couldnt find any matches!');
            } else {
                const { id, userID, username, email, role, ...partialObject } = user;
                const subset = { id, userID, username, email, role };
                logger.debug(JSON.stringify(subset));
                res.send(subset);
            }
        });
    } else if(req.userID) {
        userService.findUserById(req.userID, function (err, user) {
            if (err || !user) {
                res.send('Couldnt find any matches!');
            } else {
                const { id, userID, username, email, role, ...partialObject } = user;
                const subset = { id, userID, username, email, role };
                logger.debug(JSON.stringify(subset));
                res.send(subset);
            }
        });
    } else {
        res.status(400).send('pls provide either a userID, email or username to search for a profil');
    }
});

router.post('/resend-verification', utility.isAuthenticated, function (req,res,next) {
    userService.findUserById(req.userID, function (err, user) {
       if(err) {
           res.send(err);
       } else {
           registerService.sendEmail(user, function (err) {
               if(err) {
                   res.send(err);
               } else {
                   res.send('We have sent you a new verification mail');
               }
           });
       }
    });
});

router.post('/create', utility.isAuthenticated, function (req, res, next) {
    const pms = ac.can(req.userRole).createAny('account');
    if(pms.granted) {
        //creation requires username, email, password, role
        if(!req.body.username || !req.body.password || !req.body.email || !req.body.role) {
            logger.error('missing register data');
            res.status(400).send('please provide all necessary information in order to create a new account!');
        } else {
            userService.createUser(req.body, req.body.role,function (err, id) {
               if(err) {
                   res.send(err);
               } else {
                   res.send('new account with id: ' + id + ' got created');
               }
            });
        }
    }
});

router.post('/delete', utility.isAuthenticated, function (req,res,next) {
    const pms = ac.can(req.userRole).deleteAny('account');
    if(pms.granted) {
        if(!req.body.userID) {
            logger.error('no userID provided');
            res.status(400).send('please provide an userID to delete an account');
        } else {
            userService.deleteAccount(req.body.userID, function (err) {
                if(err) {
                    res.send(err);
                } else {
                    res.send("Account deleted succesfully!");
                }
            });
        }
    } else {
        res.status(403).send("You're not permitted to do that!");
    }
});

module.exports = router;