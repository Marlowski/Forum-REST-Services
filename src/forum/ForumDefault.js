const ForumService = require('./ForumService');
const config = require('config');

function checkForDefaultForums(callback) {
    let forumList = config.get("defaultForums").list;
    for(let i=0; i < forumList.length; i++) {
        ForumService.findForum(forumList[i], function (err, data) {
            if(err) {
                ForumService.createForum(forumList[i], function (err) {
                    if(err) {
                        return callback("error during creation of default forum: " + forumList[i], null);
                    } else {
                        return callback(null, forumList[i] + " default forum created.");
                    }
                });
            } else {
                return callback(null, "default forum " + forumList[i] + " already exists.");
            }
        });
    }
}

module.exports = {
    checkForDefaultForums
}
