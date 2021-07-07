const ForumSchema = require('./ForumModel');
const Forum = ForumSchema.Forum;
const PostSchema = require('../post/PostModel');
const Post = PostSchema.Post;
const CommentSchema = require('../comments/CommentModel');
const Comment = CommentSchema.Comment;
const logger = require('../../config/winston');


function createForum(name, callback) {
    let newForum = new Forum();
    newForum.forumName = name;

    newForum.save(function (err) {
        if(err) {
            logger.error("Could not create Forum '" + name);
            return callback(err);
        } else {
            logger.debug("Forum created");
            return callback(null);
        }
    });
}

function findForum(name, callback) {
    Forum.findOne({ forumName: name })
        .exec(function (err, forum) {
            if(err || !forum) {
                logger.debug("couldnt query for forum: " + name);
                return callback("couldnt query for forum: " + name, null);
            } else {
                logger.debug("Found forum: '" + forum.forumName + "' during query");
                return callback(null, forum);
            }
        });
}

function findForumById(forumId, callback) {
    Forum.findById(forumId)
        .exec(function (err, forum) {
            if(err || !forum) {
                logger.debug("couldnt query for forum: " + name);
                return callback("couldnt query for forum: " + name, null);
            } else {
                logger.debug("Found forum: '" + forum.forumName + "' during query");
                return callback(null, forum);
            }
        });
}

function renameForum(name, newName, callback) {
    findForum(name, function (err, forum) {
       if(err) {
           return callback(err);
       } else {
           findForum(newName, function (err, data) {
               if(data) {
                   logger.error("A forum with this name already exists!");
                   return callback("A forum with this name already exists!");
               } else {
                    forum.forumName = newName;
                    //d
                    forum.save(function (err) {
                        if(err) {
                            return callback(err);
                        } else {
                            return callback(null);
                        }
                    });
               }
           });
       }
    });
}

function deleteForum(name, callback) {
    findForum(name, function (err, forum) {
        if(err) {
            return callback(err);
        } else {
            if(!forum.defaultForum) {
                let forumId = forum._id;
                forum.remove(function (err) {
                    if(err) {
                        return callback("couldnt delete forum");
                    } else {
                        logger.debug("forum '" + forum.forumName + "' deleted.");
                        Post.deleteMany({ forumID: forumId })
                            .exec(function (err) {
                                if(err) {
                                    return callback("forum got deleted, but an error occurred during the deletion of posts that belonged to that forum");
                                } else {
                                    return callback(null);
                                }
                            });
                    }
                });



            } else {
                logger.error("cant delete default forum");
                return callback("cant delete default forum");
            }
        }
    });
}

function findPostsByForum(forumId, callback) {
    Post.find({ forumID: forumId, deleted: false })
        .exec(function (err, posts) {
            if(err) {
                return callback("couldnt query for posts in forum", null);
            } else {
                return callback(null, posts);
            }
        });
}

function getPostsFromForum(forumName, callback) {
    findForum(forumName, function (err, forum) {
        if(err) {
            return callback(err, null);
        } else {
            findPostsByForum(forum._id, function (err, posts) {
                if(err) {
                    return callback(err, null);
                } else {
                    return callback(null, posts)
                }
            });
        }
    });
}

module.exports = {
    createForum,
    deleteForum,
    renameForum,
    findForum,
    findForumById,
    getPostsFromForum
}