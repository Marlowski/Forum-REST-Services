const PostSchema = require('./PostModel');
const Post = PostSchema.Post;
const CommentSchema = require('../comments/CommentModel');
const Comment = CommentSchema.Comment;
const logger = require('../../config/winston');
const forumService = require('../forum/ForumService');

//data: title, forumName, content, postedId
function createPost(data, callback) {
    forumService.findForum(data.forumName, function (err, forum) {
        if(err || !forum) {
            return callback("Couldnt find the forum '" + data.forumName + "'!");
        } else {
            let newPost = new Post();
            newPost.postTitle = data.title;
            newPost.forumID = forum._id;
            newPost.postedByUserID = data.postedId;
            newPost.content = data.content

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

function deletePost(userId, postId, callback) {
    findPostById(postId, function (err, post) {
       if(err) {
           return callback(err, 500);
       }
       else if(userId !== "permitted" && post.postedByUserID !== userId) {
           return callback("You cant delete a post thats not your own!", 403);
       } else {
           Post.findByIdAndDelete(postId)
               .exec(function (err) {
                  if(err) {
                      return callback("An error occurred during the deletion of the post", 500);
                  } else {
                      return callback(null, 200);
                  }
               });
       }
    });
}

function findPostsFromUser(userId, callback) {
    Post.find({ postedByUserID: userId })
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

function viewPost(postId, callback) {
    findPostById(postId, function (err, post) {
       if(err) {
           return callback(err, null);
       } else {
           forumService.findForumById(post.forumID, function (err, forum) {
              if(err) {
                  return callback(err, null);
              } else {
                  const { postTitle, createdAt, postedByUserID, content, ...partialObject } = post;
                  const subset = { postTitle, createdAt, postedByUserID, content };
                  subset.forumName = forum.forumName;
                  return callback(null, subset);
              }
           });
       }
    });
}

//data: userId, postId, title, content
function updatePost(data, callback) {
    findPostById(data.postId, function (err, post) {
        if (err) {
            return callback(err, 500);
        } else if (data.userId !== "permitted" && post.postedByUserID !== data.userId) {
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