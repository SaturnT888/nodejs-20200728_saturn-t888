const { v4: uuid } = require('uuid');
const User = require('../models/User');
const sendMail = require('../libs/sendMail');

module.exports.register = async (ctx, next) => {

    try {
    
        const reqName = ctx.request.body.displayName,
            reqEmail = ctx.request.body.email,
            reqPassword = ctx.request.body.password;

        const user = await User.findOne ({email: reqEmail});

        if (!user) {
            // creating User //
            const verificationToken = uuid ();
            const newUser = new User ({email: reqEmail,
                                    displayName: reqName,
                                    verificationToken: verificationToken});
            await newUser.setPassword (reqPassword);
            await newUser.save ();

            // sending Email //
            await sendMail ({
                template: 'confirmation',
                locals: {token: 'token'},
                to: reqEmail,
                subject: 'Подтвердите почту'
            });

            // sending Response //
            ctx.status = 200;
            ctx.body = {status: 'ok'};

        } else {
            ctx.status = 400;
            ctx.body = {errors: {email: 'Такой email уже существует'}};
        }
    } catch (err) {
        ctx.throw (500, err.message);
    }

};

module.exports.confirm = async (ctx, next) => {

    try {

        reqToken = ctx.request.body.verificationToken;

        const user = await User.findOne ({verificationToken: reqToken}) || null;

        if (!user) {
            ctx.throw (400, 'Ссылка подтверждения недействительна или устарела');
        } else {
            // deleting Token //
            user.verificationToken = undefined;
            user.save ();

            // generating sessionToken //
            const sessionToken = uuid ();

            // sending Response //
            ctx.status = 200;
            ctx.body = {token: sessionToken};
            
            return;
        }

    } catch (err) {
        ctx.throw (500, err.message);
    }
  
};
