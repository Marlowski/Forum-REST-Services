const mongoose = require('mongoose');

//expiration doesnt work properly yet, expires after ca. 1 min
const RegisterSchema = new mongoose.Schema({
        userID: String,
        validation: { type: String, unique: true },
        createdAt: { type: Date, default: Date.now, index: { expires: 86400 }},
    },
);

module.exports.RegUser = mongoose.model('registrationToken', RegisterSchema, 'registration');
