const PostSchema = require('./PostModel');
const Post = PostSchema.Post;
const CommentSchema = require('../comments/CommentModel');
const Comment = CommentSchema.Comment;
const logger = require('../../config/winston');
const forumService = require('../forum/ForumService');
const userService = require('../user/userService');

//data: title, forumName, content, postedId
function createPost(data, callback) {
    forumService.findForum(data.forumName, function (err, forum) {
        if(err || !forum) {
            return callback("Couldnt find the forum '" + data.forumName + "'!");
        } else {
            let newPost = new Post();
            newPost.postTitle = data.title;
            newPost.forumID = forum._id;

            userService.findUserById(data.postedId, function (err, user) {
               if(err) {
                   return callback("couldnt find user with userID: " + data.postedId);
               } else {
                   newPost.postedByUsername = user.username;
                   newPost.content = data.content;
                   newPost.postedByUserID = user._id;

                   newPost.save(function (err) {
                       if(err) {
                           return callback("couldnt save post");
                       } else {
                           logger.debug("post saved successfully");
                           return callback(null);
                       }
                   });
               }
            });
        }
    });
}

function findPostById(postId, callback) {
    Post.findById(postId)
        .exec(function (err, post) {
           if(err || !post) {
               return callback("couldnt query for postId: " + postId, null);
           } else {
               return callback(null, post);
           }
        });
}

function deletePost(userId, postId, permitted, callback) {
    findPostById(postId, function (err, post) {
       if(err) {
           return callback(err, 500);
       }
       userService.findUserById(userId, function (err, user) {
           if (err) {
               return callback("Couldn't find user", 500);
           } else {
               if(!permitted && post.postedByUserID !== user._id.toString()) {
                   return callback("You cant delete a post thats not your own!", 403);
               } else {
                   Post.findById(postId)
                       .exec(function (err, post) {
                           if(err) {
                               return callback("An error occurred during the deletion of the post", 500);
                           } else {
                               post.deleted = true;
                               post.content = "[deleted]";
                               post.postTitle = "[deleted]";

                               post.save(function (err) {
                                   if(err) {
                                       return callback("couldnt update deletion post", 500);
                                   } else {
                                       logger.debug("post deletion updated successfully");
                                       return callback(null, 200);
                                   }
                               });
                           }
                       });
               }
           }
       });
    });
}

function findPostsFromUser(userId, callback) {
    userService.findUserById(userId, function (err, user) {
        if(err) {
            return callback("couldnt find user");
        } else {
            Post.find({ postedByUserID: user._id, deleted: false })
                .exec(function (err, posts) {
                    if(err || !posts) {
                        logger.debug("couldnt query for posts from userId: " + userId);
                        return callback("couldnt query for posts from userId: " + userId, null);
                    } else {
                        logger.debug("user posts found");
                        return callback(null, posts);
                    }
                });
        }
    });
}

function viewPost(postId, callback) {
    findPostById(postId, function (err, post) {
       if(err) {
           return callback(err, null);
       } else {
           forumService.findForumById(post.forumID, function (err, forum) {
              if(err) {
                  return callback(err, null);
              } else {
                  logger.debug("post & forum found");
                  const { postTitle, createdAt, postedByUserID, postedByUsername, content, edited, ...partialObject } = post;
                  const subset = { postTitle, createdAt, postedByUserID, postedByUsername, content, edited };
                  subset.forumName = forum.forumName;
                  return callback(null, subset);
              }
           });
       }
    });
}

//data: userId, postId, title, content
function updatePost(data, permitted, callback) {
    findPostById(data.postId, function (err, post) {
        if (err) {
            return callback(err, 500);
        } else {
            userService.findUserById(data.userId, function (err, user) {
               if(err) {
                   return callback(err);
               } else {
                   if (!permitted && post.postedByUserID !== user._id.toString()) {
                       return callback("You cant change a post thats not your own!", 403);
                   } else {
                       if(data.title) { post.postTitle = data.title }
                       if(data.content) { post.content = data.content }
                       post.edited = true;
                       post.save(function (err) {
                           if(err) {
                               return callback("An error occurred while trying to update the post", 500);
                           } else {
                               return callback(null, 200)
                           }
                       });
                   }
               }
            });
        }
    });
}

function getCommentsByPost(postId, callback) {
    Comment.find({ commentOnPostID: postId })
        .exec(function (err, comments) {
           if(err) {
               return callback("An error occurred while querying for the comments of the post", null);
           } else {
               return callback(null, comments);
           }
        });
}


module.exports = {
    createPost,
    deletePost,
    viewPost,
    findPostsFromUser,
    updatePost,
    findPostById,
    getCommentsByPost
}