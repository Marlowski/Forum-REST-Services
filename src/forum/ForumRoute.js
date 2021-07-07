const express = require('express');
const router = express.Router();
const utility = require('../utility/Utility');
const forumService = require('./ForumService');
const userRoles = require('../user/userRoles');
const ac = userRoles.AccesControlObj;


router.post('/create', utility.isAuthenticated, function (req, res) {
    const permission = ac.can(req.userRole).createAny('forum');
    if (permission.granted) {
        if(!req.body.name) {
            res.status(400).send('please provide all necessary information to create a forum!');
        } else {
            forumService.createForum(req.body.name, function (err) {
                if(err) {
                    res.status(500).send(err);
                } else {
                    res.send("Forum: '" + req.body.name + "' created successfully.");
                }
            });
        }
    } else {
        res.status(403).send("You're not permitted to do that!");
    }
});


router.post('/delete', utility.isAuthenticated, function (req, res) {
    const permission = ac.can(req.userRole).deleteAny('forum');
    if (permission.granted) {
        if(!req.body.name) {
            res.status(400).send('missing forum name to delete');
        } else {
            forumService.deleteForum(req.body.name, function (err) {
                if(err) {
                    res.status(500).send(err);
                } else {
                    res.send("Forum: '" + req.body.name + "' deleted successfully.");
                }
            });
        }
    } else {
        res.status(403).send("You're not permitted to do that!");
    }
});

router.post('/rename', utility.isAuthenticated, function (req, res) {
    const permission = ac.can(req.userRole).updateAny('forum');
    if (permission.granted) {
        if (!req.body.name || !req.body.newName) {
            res.status(400).send('missing information to change forum name');
        } else {
            forumService.renameForum(req.body.name, req.body.newName, function (err) {
               if(err) {
                   res.status(500).send(err);
               } else {
                   res.send('forum name changed successfully')
               }
            });
        }
    } else {
        res.status(403).send("You're not permitted to do that!");
    }
});

router.post('/posts', function (req, res) {
    if(!req.body.forumName) {
        res.status(400).send({message: 'missing forum name'});
    } else {
        forumService.getPostsFromForum(req.body.forumName, function (err, posts) {
            if(err) {
                res.status(500).send({message: err});
            } else {
                res.send({message: posts});
            }
        });
    }
});

module.exports = router;