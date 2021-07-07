const express = require('express');
const router = express.Router();
const utility = require('../utility/Utility');
const messageService = require('./MessagesService');
const userRoles = require('../user/userRoles');
const ac = userRoles.AccesControlObj;


router.get('/', utility.isAuthenticated, function (req,res) {
    messageService.getMessages(req.userID, function (err, messages) {
        if(err) {
            res.status(400).send({message: err});
        } else {
            res.send({message: messages});
        }
    });
});

router.get('/sent-messages', utility.isAuthenticated, function (req,res) {
    messageService.getSendMessages(req.userID, function (err, messages) {
        if(err) {
            res.status(400).send({message: err});
        } else {
            res.send({message: messages});
        }
    });
});

router.post('/send', utility.isAuthenticated, function(req,res) {
    const permission = ac.can(req.userRole).createOwn('message');
    if (permission.granted) {
        console.log(req.body);
        if(!req.body.toUsername || !req.body.subject || !req.body.text) {
            res.status(400).send({message: 'please provide all necessary information to send a message!'});
        } else {
            messageService.writeMessage(req.userID, req.body.toUsername, req.body.subject, req.body.text, function (err) {
                if(err) {
                    res.status(400).send({message: err});
                } else {
                    res.send({message: "Message sent to " + req.body.toUsername});
                }
            });
        }
    } else {
        res.status(403).send({message: "You're not permitted to do that!"});
    }
});

router.get('/open', utility.isAuthenticated, function (req,res) {
    if(!req.query.id || !req.query.action) {
        res.status(500).send({message: 'something went wrong while passing the correct arguments.'});
    } else {
        if(req.query.action === "read") {
            messageService.readMessage(req.query.id, req.query.view, req.userID, function (err, message) {
               if(err) {
                   res.send({message: err});
               } else {
                   res.send({message: message});
               }
            });
        } else if(req.query.action === "delete") {
            messageService.deleteMessage(req.query.id, req.userID, function (err) {
                if(err) {
                    res.status(500).send({message: err});
                } else {
                    res.send({message: "message deleted successfully!"});
                }
            });
        } else {
            res.status(500).send({message: "something went wrong while trying to " + req.query.action + " the message."});
        }
    }
});

router.get('/has-unread', utility.isAuthenticated, function (req, res) {
   messageService.hasUnreadMessage(req.userID, function (hasUnread) {
      if(hasUnread) {
          res.send({message: true});
      } else {
          res.send({message: false});
      }
   });
});

module.exports = router;