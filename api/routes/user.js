const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const checkAuth = require('../middleware/check-auth');

router.post('/signup', (req, res, next) =>{
    User
    .find({email: req.body.email})
    .exec()
    .then(user => {
        if(user.length >= 1)
            return res.status(422).json({
                message: "Mail exists!"
            });
        else{
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if(err){
                    return res.status(500).json({error:err});
                }else{
                    const user = new User({
                        _id: mongoose.Types.ObjectId(),
                        email: req.body.email,
                        phone: req.body.phone,
                        password: hash
                    });
                    user
                        .save()
                        .then(result => {
                            console.log(result);
                            res.status(201).json({
                                message: 'User created'
                            });
                        })
                        .catch(err => {
                            console.log(err);
                            res.status(500).json({
                                error:err
                            });         
                        });
                }
            });
        }
    })
    .catch();
});

router.post('/login', (req, res, next) => {
    console.log(mongoose.connection.readyState);
    User.find({email : req.body.email})
    .exec()
    .then(user => {
        if(user.length < 1){
            return res.status(404).json({
                message : "Authorisation failed"
            });
        }

        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
            if(err){
                return res.status(401).json({
                    message : "Auth failed"
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
                
                return res.status(200).json({
                    message : "Login successful",
                    userID : user[0]._id,
                    token : tok
                });
            }
            else{
                return res.status(401).json({
                    message : "Auth failed"
                });
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error:err
        });
    });
});




//  MASTER OPTIONS


/*
    getAllUsers : This route is solely for checking purposes. Don't expose it.
*/
router.get('/', (req, res, next) => {
    User
    .find()
    .then(result => {
        res.status(200).json(result);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error:err
        });
    });
});

/*
    deleteAllUsers : This route is solely for checking purposes. Don't expose it.
*/
router.delete('/', checkAuth, (req, res, next) => {
    User.deleteMany().exec();
});

/*
    deleteUserById : This route is solely for checking purposes. Don't expose it.
*/
router.delete("/:userId", checkAuth, (req, res, next) => {
    User.remove({_id: req.params.userId})
    .exec()
    .then(result => {
        res.status(200).json({
            message : "Delete success!"
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error:err
        });
    });
});

module.exports = router;