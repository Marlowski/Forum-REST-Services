const CommentSchema = require('./CommentModel');
const Comment = CommentSchema.Comment;
const logger = require('../../config/winston');
const postService = require('../post/PostService');


//data: fromUserId, postId, content
function createComment(data, callback) {
    postService.findPostById(data.postId, function (err, post) {
       if(err) {
           return callback(err);
       } else {
           let newComment = new Comment();
           newComment.commentCreatedByUserID = data.fromUserId;
           newComment.commentOnPostID = post._id;
           newComment.content = data.content;
           newComment.save(function (err) {
              if(err) {
                  logger.error("couldnt save comment");
                  return callback("couldnt save comment");
              } else {
                  logger.debug("new comment saved successfully");
                  return callback(null);
              }
           });
       }
    });
}

function findCommentById(commentId, callback) {
    Comment.findById(commentId)
        .exec(function (err, comment) {
           if(err || !comment) {
               logger.error("couldnt query for comment!");
               return callback("couldnt query for comment!", null);
           } else {
               return callback(null, comment);
           }
        });
}

function deleteComment(commentId, userId, callback) {
    findCommentById(commentId, function (err, comment) {
       if(err) {
           return callback(err, 500);
       } else {
           if(userId !== "permitted" && comment.commentCreatedByUserID !== userId) {
               return callback("You cant delete a comment thats not your own!", 403);
           } else {
               Comment.findByIdAndDelete(commentId)
                   .exec(function (err) {
                       if(err) {
                           return callback("An error occurred during the deletion of the comment", 500);
                       } else {
                           return callback(null, 200);
                       }
                   });
           }
       }
    });
}

//data: userId, commentId, content
function updateComment(data, callback) {
    findCommentById(data.commentId, function (err, comment) {
        if (err) {
            return callback(err, 500);
        } else if (data.userId !== "permitted" && comment.commentCreatedByUserID !== data.userId) {
            return callback("You cant edit a comment thats not your own!", 403);
        } else {
            comment.content = data.content;
            comment.edited = true;
            comment.save(function (err) {
                if(err) {
                    return callback("An error occurred while trying to update the comment", 500);
                } else {
                    return callback(null, 200)
                }
            });
        }
    });
}

function findCommentsFromUser(userId, callback) {
    Comment.find({ commentCreatedByUserID: userId })
        .exec(function (err, comments) {
           if(err) {
               return callback("an error occurred while querying for the comments", null);
           } else {
               return callback(null, comments);
           }
        });
}

module.exports = {
    createComment,
    deleteComment,
    updateComment,
    findCommentsFromUser
}