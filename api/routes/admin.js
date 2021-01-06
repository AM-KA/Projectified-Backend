const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const strings = require('../constants/strings');
const Admin = require('../models/admin');
const checkAuthAdmin = require('../middleware/check-auth-admin');

/*
    logIn
*/
router.post('/login', (req, res, next) => {
    console.log(mongoose.connection.readyState);
    Admin.find({email : req.body.email})
    .exec()
    .then(user => {
        if(user.length < 1){
            return res.status(200).json({
                code:404,
                message : strings.AUTH_FAILED
            });
        }

        bcrypt.compare(req.body.password, user[0].password, async (err, result) => {
            if(err){
                return res.status(200).json({
                    code:401,
                    message : strings.AUTH_FAILED
                });
            }
            if(result){
                const tok = jwt.sign({
                    email : user[0].email,
                    userID : user[0]._id  
                },
                process.env.JWT_SECRET_ADMIN,
                {
                    expiresIn : "30d"
                });
                const tokUser = jwt.sign({
                    email : user[0].email,
                    userID : user[0]._id  
                },
                process.env.JWT_SECRET_USUAL,
                {
                    expiresIn : "30d"
                });
                console.log(user[0]._id);
                return res.status(200).json({
                    code:200,
                    message : "Login successful",
                    userID : user[0]._id,
                    token : tok,
                    tokenUser: tokUser
                });
            }
            else{
                return res.status(200).json({
                    code:401,
                    message : strings.AUTH_FAILED
                });
            }
        });
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({
            code: 500,
            message: strings.ERROR_OCCURED,
            error: err
        });
    });
});

module.exports = router;