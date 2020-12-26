const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
//const Profile = require('../models/profile');
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
                message : "Authorization failed"
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
                //const profile = await Profile.findOne({_id: user[0]._id});
                //var profileCompl = (profile!=null);
                //console.log(profileCompl);
                /*if(profileCompl){
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
                return res.status(200).json({
                    code:200,
                    message : "Login successful",
                    userID : user[0]._id,
                    token : tok,
                    userName: user[0].name,
                    profileCompleted : user[0].profileCompleted,
                    profile : profile
                });*/
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

/*
    createProfile
*/
/*router.post('/', checkAuth, (req, res, next) => {
    const date = new Date();
    const user =  new User({
        _id: mongoose.Types.ObjectId(req.body.userID) ,
        name: req.body.name,
        date: date,
        collegeName: req.body.collegeName,
        course: req.body.course,
        semester: req.body.semester,
        languages: req.body.languages,
        interest1: req.body.interest1,
        interest2: req.body.interest2,
        interest3: req.body.interest3,
        hobbies: req.body.hobbies,
        description: req.body.description,
       
    });
    console.log(User);
    user
    .save()
    .then(result => {
        res.status(200).json({
            code: 200,
            message: "Profile Created Succesfully",
            user_id : result._id
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
});*/

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
            message: "Some error occured.",
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
                message: "Not found!"
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
                    message : "Delete success!"
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error:err
                });
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