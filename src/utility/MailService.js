const config = require('config');
const logger = require('../../config/winston');
const nodemailer = require('nodemailer');


let smtpTransport = nodemailer.createTransport({
    service: config.get('mailService').service,
    auth: {
        user: config.get('mailService').username,
        pass: config.get('mailService').password
    }
});


function sendVerificationMail(data, callback) {
    let mailOptions = {
        to: data.email,
        subject: "Campfire account verification",
        html: "<h2>Welcome "+ data.username +"!</h2><br/><p>Click on the link below to finish the registration process of your campfire account!</p><br/>https://localhost:3000/verify?mailtoken="+ data.token +"<br/><p>This link will expire in 24 hours</p>"
    }
    smtpTransport.sendMail(mailOptions, function (err, response) {
        if(err) {
            logger.error('couldnt send verification email');
            return callback(err);
        } else {
            logger.debug("verification email send");
            return callback(null);
        }
    });
}

function newMessageNotification(data, callback) {
    let mailOptions = {
        to: data.email,
        subject: "New message from " + data.fromUsername,
        html: "<h2>" + data.fromUsername + " has sent you a message</h2><br/><p>" + data.context + "</p>"
    }
    smtpTransport.sendMail(mailOptions, function (err, response) {
        if(err) {
            logger.error('couldnt send notification email')
            return callback(err);
        } else {
            logger.debug("notification email send");
            return callback(null);
        }
    });
}

function sendNewsletter(mailAdress, data, callback) {
    let mailOptions = {
        to: mailAdress,
        subject: data.subject + " | Campfire Newsletter",
        html: data.context
    }
    smtpTransport.sendMail(mailOptions, function (err, response) {
        if(err) {
            logger.error('couldnt send newsletter email')
            return callback(err);
        } else {
            logger.debug("newsletter email send");
            return callback(null);
        }
    });
}

module.exports = {
    sendVerificationMail,
    newMessageNotification,
    sendNewsletter
}


