const jwt = require('jsonwebtoken');
const config = require('config');
const logger = require('../../config/winston');

function decodeCredentials(req, callback) {
    logger.debug('check for Basic Auth. credentials');
    if(!req.headers.authorization || req.headers.authorization.indexOf('Basic') === -1) {
        return callback(true, null);
    }

    logger.debug('decode credentials');
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials= Buffer.from(base64Credentials, 'base64').toString('ascii');
    const[username, password] = credentials.split(':');
    logger.debug('credentials successfully decoded');
    return callback(false, {username, password});
}

function isAuthenticated(req, res, next) {
    if(typeof req.headers.authorization !== "undefined") {
        let token = req.headers.authorization.split(" ")[1];
        var privateKey = config.get('session.tokenKey');
        jwt.verify(token, privateKey, {algorithm: "H256"}, (err, user) => {
            if(err) {
                res.status(500).json({ error: "Not Authorized" });
                return;
            }

            let payload = token.split(".")[1];
            //decode bas64 info and turn into JSON object
            let tokenUserData = JSON.parse(Buffer.from(payload, 'base64').toString('ascii'));
            //attach data to req Object
            req.userID = tokenUserData.user;
            req.userRole = tokenUserData.role;
            return next();
        });
    } else {
        res.status(500).json({ error: "Not Authorized" });
        return;
    }
}

module.exports = {
    isAuthenticated,
    decodeCredentials
}
