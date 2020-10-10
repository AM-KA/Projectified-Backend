const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Profile = require('../models/profile');
const checkAuth = require('../middleware/check-auth');

/*
    signUp
*/
router.post('/signup', (req, res, next) =>{
    User
    .find({email: req.body.email})
    .exec()
    .then(user => {
        if(user.length >= 1)
            return res.status(200).json({
                code:422,
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
                            res.status(200).json({
                                code:200,
                                message: 'User created'
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
                }
            });
        }
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


/*
     
      check signUp 

  */
 router.post('/checksignup', (req, res, next) =>{
     const emailC=req.body.email
     const phoneC = req.body.phone

    User
    .find({email:emailC})
    .exec()
    .then(user => {
        if(user.length >= 1){
            return res.status(300).json({
                code:300,
                message: "User Already Registered"
            });
        }
            else if(user.length==0)
            {
                User
                .find({phone:phoneC})
                .exec()
                .then(user2 => {
                    if(user2.length >= 1){
                        return res.status(300).json({
                            code:300,
                            message: "User Already Registered"
                        });
                    }
                    else
                       return res.status(200).json({
                           code:200,
                           message:"Credentials are Ok"
                       }) 

                })
                        .catch(err => {
                            console.log(err);
                            return res.status(500).json(err);
                        });
        }

         
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json(err);
    });
});
        

/*
    logIn
*/
router.post('/login', (req, res, next) => {
    console.log(mongoose.connection.readyState);
    User.find({email : req.body.email})
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
                const profile = await Profile.findOne({_id: user[0]._id});
                var profileCompl = (profile!=null);
                console.log(profileCompl);
                if(profileCompl){
                    return res.status(200).json({
                        code:200,
                        message : "Login successful",
                        userID : user[0]._id,
                        token : tok,
                        userName: profile.name,
                        profileCompleted : true,
                        profile : profile
                    });
                }else{
                    return res.status(200).json({
                        code:200,
                        message : "Login successful",
                        userID : user[0]._id,
                        token : tok,
                        userName: null,
                        profileCompleted : false,
                        profile: null
                    });
                }
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




//  MASTER OPTIONS


/*
    getAllUsers : This route is solely for checking purposes. Don't expose it.
*/
router.get('/', (req, res, next) => {
    User
    .find()
    .then(result => {
        res.status(200).json({
            ...result,
            code: 200,
            message: "Fetch success."
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


/*
    deleteAllUsers : This route is solely for checking purposes. Don't expose it.
*/
router.delete('/', checkAuth, (req, res, next) => {
    User.deleteMany().exec()
    .then(result => {
        res.status(200).json({
            code:200,
            message : "Delete success"
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error:err
        });
    });
});



/*
    getUserById :  This route is solely for checking purposes. Don't expose it.
*/
router.get('/:userId', (req, res, next) => {
    User
    .findOne({_id: req.params.userId})
    .exec()
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