const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Admin = require('../models/admin');
const checkAuth = require('../middleware/check-auth');

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
                message : "Authorisation failed"
            });
        }

        bcrypt.compare(req.body.password, user[0].password, async (err, result) => {
            if(err){
                return res.status(200).json({
                    code:401,
                    message : "Authorization failed"
                });
            }
            if(result){
                const tok = jwt.sign({
                    email : user[0].email,
                    userID : user[0]._id  
                },
                "secret",
                {
                    expiresIn : "1h"
                });
                console.log(user[0]._id);
                return res.status(200).json({
                    code:200,
                    message : "Login successful",
                    userID : user[0]._id,
                    token : tok
                });
            }
            else{
                return res.status(200).json({
                    code:401,
                    message : "Authorization failed"
                });
            }
        });
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({
            code: 500,
            message: "Some error occured.",
            error: err
        });
    });
});

module.exports = router;