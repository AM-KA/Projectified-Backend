const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const strings = require('../constants/strings');
const User = require('../models/user');
const checkAuth = require('../middleware/check-auth');
const checkAuthAdmin = require('../middleware/check-auth-admin');

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
                message: strings.MAIL_EXISTS
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
                        password: hash,
                        name:req.body.name,
                        profileCompleted: false
                    });
                    user
                        .save()
                        .then(result => {
                            console.log(result);
                            res.status(200).json({
                                code:200,
                                message: 'New user was created successfully'
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
                }
            });
        }
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
                message: strings.MAIL_EXISTS
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
                        message: strings.PHONE_EXISTS
                    });
                }
                else
                    return res.status(200).json({
                        code:200,
                        message: strings.CREDENTIALS_OK
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
                process.env.JWT_SECRET_USUAL,
                {
                    expiresIn : "1h"
                });
                console.log(user[0]._id);
                return res.status(200).json({
                    code:200,
                    message : "Login successful",
                    token: tok,
                    ...user[0]._doc
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


/*
    updateProfile
*/
router.patch('/:userId', checkAuth, (req, res, next) => {
    const userId = req.params.userId;

    User.updateOne(
        {_id : mongoose.Types.ObjectId(userId)},
        {$set : 
            {
                name: req.body.name,
                date: req.body.date, 
                collegeName: req.body.collegeName,
                course: req.body.course,
                semester: req.body.semester,
                languages: req.body.languages,
                interest1: req.body.interest1,
                interest2: req.body.interest2,
                interest3: req.body.interest3,
                hobbies: req.body.hobbies,
                description: req.body.description,
                profileCompleted:true
            }
        }
    )
    .exec()
    .then(result => {
        res.status(200).json({
            code: 200,
            message: "User profile updated successfully." 
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



/*
    getUserById
*/
router.get('/:userId', (req, res, next) => {
    const userId = req.params.userId;

    User.findOne({_id : mongoose.Types.ObjectId(userId)})
    .exec()
    .then(result => {
        if(result){
            res.status(200).json({
                code: 200,
                message: "Profile fetched successfully.",
                ...result._doc
            });
        }
        else{
            res.status(404).json({
                code: 404,
                message: strings.NOT_FOUND
            });
        }
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



//  MASTER OPTIONS


/*
    getAllUsers : This route is solely for checking purposes. Don't expose it.
*/
router.get('/', checkAuthAdmin, (req, res, next) => {
    User
    .find()
    .then(result => {
        res.status(200).json({
            ...result,
            code: 200,
            message: "Users were fetched successfully."
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


/*
    deleteAllUsers : This route is solely for checking purposes. Don't expose it.
*/
router.delete('/', checkAuthAdmin, (req, res, next) => {
    User.deleteMany().exec()
    .then(result => {
        res.status(200).json({
            code:200,
            message : "All users deleted successfully."
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
router.get('/:userId', checkAuthAdmin, (req, res, next) => {
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
router.delete("/:userId", checkAuthAdmin, (req, res, next) => {
    const uid = req.params.userId
    Application.deleteMany({applicant_id: uid})
    .then(xyz => {
        Offer
        .deleteMany({recruiter_id : uid})
        .exec()
        .then(result =>{
            User.remove({_id: req.params.userId})
            .exec()
            .then(result => {
                res.status(200).json({
                    code:200,
                    message : "User deleted successfully."
                });
            })
        })
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