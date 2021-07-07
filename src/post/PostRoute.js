const express = require('express');
const router = express.Router();
const utility = require('../utility/Utility');
const postService = require('./PostService');
const userRoles = require('../user/userRoles');
const ac = userRoles.AccesControlObj;


router.post('/create', utility.isAuthenticated, function (req, res) {
    const permission = ac.can(req.userRole).createOwn('post');
    if (permission.granted) {
        if(!req.body.title || !req.body.forumName || !req.body.content) {
            res.status(400).send({message: 'please provide all necessary information to create a post!'});
        } else {
            postService.createPost({title: req.body.title, forumName: req.body.forumName, content: req.body.content, postedId: req.userID }, function (err) {
               if(err) {
                   res.status(500).send({message: err});
               } else {
                   res.send({message: "post created successfully!"});
               }
            });
        }
    } else {
        res.status(403).send({message: "You're not permitted to do that!"});
    }
});

router.post('/delete', utility.isAuthenticated, function (req, res) {
    const permission = ac.can(req.userRole).deleteOwn('post');
    if (permission.granted) {
        if(!req.body.postId) {
            res.status(400).send({message: 'please provide all necessary information to create a post!'});
        } else {
            let userId = req.userID;
            let adminRights = false
            if(ac.can(req.userRole).deleteAny('post').granted) {
                adminRights = true;
            }

            postService.deletePost(userId, req.body.postId, adminRights, function (err, status) {
               if(err) {
                   res.status(status).send({message: err});
               } else {
                   res.send({message: "post deleted successfully"});
               }
            });
        }
    } else {
        res.status(403).send({message: "You're not permitted to do that!"});
    }
});

router.get('/view', function (req, res) {
    if(!req.query.postId) {
        res.status(400).send({message: 'cant view post without post id!'});
    } else {
        postService.viewPost(req.query.postId, function (err, post) {
           if(err) {
               res.status(500).send({message: err});
           } else {
               res.send({message: post});
           }
        });
    }
});

router.get('/own', utility.isAuthenticated, function (req, res) {
   postService.findPostsFromUser(req.userID, function (err, posts) {
      if(err) {
          res.status(500).send({message: err});
      } else {
          res.send({message: posts});
      }
   });
});

router.post('/edit', utility.isAuthenticated, function (req, res) {
    if(ac.can(req.userRole).updateOwn('post').granted) {
        if(!req.body.postId) {
            res.status(400).send({message: "missing postId to know which post to edit!"});
        } else if(!req.body.title && !req.body.content) {
            res.status(400).send({message: "nothing to change"});
        } else {

            let userId = req.userID;
            let adminRights = false;
            if(ac.can(req.userRole).updateAny('post').granted) {
                adminRights = true;
            }

            postService.updatePost({postId: req.body.postId, userId: userId, title: req.body.title, content: req.body.content }, adminRights, function (err, status) {
                if(err) {
                    res.status(status).send({message: err});
                } else {
                    res.send({message: "post updated succesfully!"});
                }
            });
        }
    } else {
        res.status(403).send("You're not permitted to do that!");
    }
});

router.post('/comments', function (req, res) {
    if(!req.body.postId) {
        res.status(400).send({message: "missing postId to know which comments to find"});
    } else {
        postService.getCommentsByPost(req.body.postId, function (err, comments) {
           if(err) {
               res.status(500).send({message: err});
           } else {
               res.send({message: comments});
           }
        });
    }

});

module.exports = router;
