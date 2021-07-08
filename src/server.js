const fs = require('fs');
const path = require('path');

let keyPath = path.join(__dirname, '..', 'certificates', 'key.pem');
let certPath = path.join(__dirname, '..', 'certificates', 'cert.pem');
const key = fs.readFileSync(keyPath, 'utf8');
const cert = fs.readFileSync(certPath, 'utf8');

const express = require('express');
const https = require('https');
const database = require('./database/db');
const bodyParser = require('body-parser');
const logger = require('../config/winston');
const cors = require('cors');

const app = express();
const server = https.createServer({key: key, cert: cert}, app);
app.use(cors());

//necessary to be able to read JSON body
app.use(bodyParser.json());

const userRoutes = require('./user/userRoute');
const authenticationRoutes = require('./authentication/AuthenticationRoute');
const registerRoutes = require('./register/RegisterRoute');
const messageRoutes = require('./messages/MessagesRoute');
const newsletterRoutes = require('./newsletter/NewsletterRoute');
const forumRoutes = require('./forum/ForumRoute');
const postRoutes = require('./post/PostRoute');
const commentRoutes = require('./comments/CommentRoute');

const userDefault = require('./user/userDefault');
const forumDefault = require('./forum/ForumDefault');

// adding routes
app.use('/users', userRoutes);
app.use('/authenticate', authenticationRoutes);
app.use('/register', registerRoutes);
app.use('/messages', messageRoutes);
app.use('/newsletter', newsletterRoutes);
app.use('/forum', forumRoutes);
app.use('/post', postRoutes);
app.use('/comment', commentRoutes);


database.initDB(function (err, db) {
    if(db) {
        logger.debug("database connected succesfully");
    } else {
        logger.debug("connection to databased failed")
    }
});

//check for existing admin account, if it doesnt exist, create one
userDefault.checkForDefaultAdmin(function (err, info) {
    if(err) {
        logger.debug(err);
    } else {
        logger.debug('no default admin was found');
        logger.debug(info);
    }
});

//check if default forums exist
forumDefault.checkForDefaultForums(function (err, info) {
//removed logger to prevent spamming of the terminal log
    return;
});

app.get('/', function (req, res) {
    res.send("Main page");
});

app.use(function (req, res, next) {
    res.status(404).send('Sorry cant find this URL');
});

app.use(function (req, res, next, err) {
    logger.error(err);
    res.status(500).send('Something broke!');
});

server.listen(443);
module.exports = app; //for chai tests


