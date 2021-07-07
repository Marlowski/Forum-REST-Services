const express = require('express');
const router = express.Router();
const utility = require('../utility/Utility');
const commentService = require('./CommentService');
const userRoles = require('../user/userRoles');
const ac = userRoles.AccesControlObj;


router.post('/write', utility.isAuthenticated, function(req, res) {
    const permission = ac.can(req.userRole).createOwn('post');
    if (permission.granted) {
        if(!req.body.postId || !req.body.content) {
            res.status(400).send({message: 'Please provide all necessary information to create a comment!'});
        } else {
            commentService.createComment({fromUserId: req.userID, postId: req.body.postId, content: req.body.content }, function (err) {
                if(err) {
                    res.status(500).send({message: err});
                } else {
                    res.send({message: "Comment created successfully!"});
                }
            });
        }
    } else {
        res.status(403).send({message: "You're not permitted to do that!"});
    }
});

router.post('/delete', utility.isAuthenticated, function (req, res) {
    const permission = ac.can(req.userRole).deleteOwn('comment');
    if (permission.granted) {
        if(!req.body.commentId) {
            res.status(400).send({message: 'please provide all necessary information to delete a comment!'});
        } else {
            let userId = req.userID;
            let adminRights = false;
            if(ac.can(req.userRole).deleteAny('comment').granted) {
                adminRights = true;
            }

            commentService.deleteComment(req.body.commentId, userId, adminRights, function (err, status) {
               if(err) {
                   res.status(status).send({message: err});
               } else {
                   res.send({message: "comment deleted succesfully"});
               }
            });
        }
    } else {
        res.status(403).send({message: "You're not permitted to do that!"});
    }
});

router.post('/edit', utility.isAuthenticated, function (req, res) {
    if(ac.can(req.userRole).updateOwn('comment').granted) {
        if(!req.body.commentId || !req.body.content) {
            res.status(400).send({message: "missing information to edit comment!"});
        } else if(!req.body.content) {
            res.status(400).send({message: "nothing to change"});
        } else {

            let userId = req.userID;
            let adminRights = false;
            if(ac.can(req.userRole).updateAny('comment').granted) {
                adminRights = true;
            }

            commentService.updateComment({commentId: req.body.commentId, userId: userId, content: req.body.content }, adminRights, function (err, status) {
                if(err) {
                    res.status(status).send({message: err});
                } else {
                    res.send({message: "comment updated!"});
                }
            });
        }
    } else {
        res.status(403).send({message: "You're not permitted to do that!"});
    }
});

router.get('/own', utility.isAuthenticated, function (req, res) {
    commentService.findCommentsFromUser(req.userID, function (err, posts) {
        if(err) {
            res.status(500).send({message: err});
        } else {
            res.send({message: posts});
        }
    });
});

module.exports = router;