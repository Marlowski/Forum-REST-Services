const mongoose = require('mongoose');
const bcyrpt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    userID: { type: String, unique: true },
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: String,
    image: String,
    newsletter: { type: Boolean, default: false },
    role: String,
}, { timestamps: true }
);

UserSchema.pre('save', function (next) {
   let user = this;
   if(!user.isModified('password')) { return next(); }
   bcyrpt.hash(user.password, 10).then((hashedPassword) => {
       user.password = hashedPassword;
       next();
   }, function (err) {
       next(err);
   })
});

UserSchema.methods.comparePassword = function (givenPassword, callback) {
    bcyrpt.compare(givenPassword, this.password, function (err, isMatch) {
        if(isMatch) {
            callback(null, isMatch);
        } else {
            callback(err, null);
        }
    });
}

module.exports.User = mongoose.model('users', UserSchema, 'users');
