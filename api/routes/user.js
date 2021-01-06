const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const strings = require('../constants/strings');
const User = require('../models/user');
const Application = require('../models/application');
const Offer = require('../models/offer');
const checkAuth = require('../middleware/check-auth');
const checkAuthAdmin = require('../middleware/check-auth-admin');
const nodemailer = require('nodemailer');

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
                        profileCompleted: false,
                        date: Date.now()
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
                    expiresIn : "30d"
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

router.post('/reset/generateOtp', (req, res, next)=>{
    const emailId = req.body.email;
    User.find({email:emailId})
    .exec()
    .then(async user => {
        if(user.length < 1){
            return res.status(200).json({
                code:400,
                message:strings.AUTH_FAILED
            });
        }
        const otpTime = user[0].resetRequestTimestamp;
        const timeDifference = ((new Date()).getTime() - otpTime.getTime())/(1000*60);
        if(timeDifference<5){
            return res.status(200).json({
                code:400,
                message:strings.TOO_SOON
            })   
        }
        var digits = '0123456789'; 
        let OTP = ''; 
        for (let i = 0; i < 6; i++ ) { 
            OTP += digits[Math.floor(Math.random() * 10)]; 
        }
        let transporter = nodemailer.createTransport({
            service:'gmail',
            auth:{
                user:'am.ka.apps@gmail.com',
                pass:process.env.MAIL_PW
            }
        })
        var message = {
            from:'am.ka.apps@gmail.com',
            to:emailId,
            subject:"Projectified: OTP for Password Reset",
            text:"OTP for your Password Reset Request is "+OTP+".",
            html:"<p>OTP for your Password Reset Request is "+OTP+".</p>"
        }
        let update = await User.updateOne({_id:user[0]._id}, {$set:{resetRequestTimestamp:Date.now(), resetOtp:OTP}});
        let info = await transporter.sendMail(message)
        return res.status(200).json({
            code:200,
            message:strings.OTP_SENT
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

router.post('/reset/verifyOtp', (req, res, next)=>{
    const body = req.body;
    User.find(body)
    .exec()
    .then(user=>{
        if(user.length==0){
            return res.status(200).json({
                code:400,
                message:strings.AUTH_FAILED
            });
        }
        User.updateOne(body, {resetOtp:"000000", resetRequestAccepted:true})
        .then(result=>{
            return res.status(200).json({
                code:200,
                message:strings.OTP_SUCCESS
            });
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

router.post('/reset/updatePassword',(req, res, next)=>{
    User
    .find({email: req.body.email, resetRequestAccepted:true})
    .exec()
    .then(user => {
        if(user.length < 1)
            return res.status(200).json({
                code:400,
                message: strings.BAD_REQUEST
            });
        else{
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if(err){
                    return res.status(500).json({error:err});
                }
                User
                .updateOne(
                    {email:req.body.email},
                    {password:hash, resetRequestAccepted:false}
                )
                .then(result => {
                    console.log(result);
                    res.status(200).json({
                        code:200,
                        message: 'Password was updated successfully.'
                    });
                })
                
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
router.get('/:userId', checkAuthAdmin, (req, res, next) => {
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
            users:result,
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
    .then(async xyz => {
        const offers = await Offer.find({recruiter_id : uid})
        var offerIdList = [];
        for(i=0; i<offers.length; i++){
            offerIdList.push(offers[i]._id)
        }
        const del = await Application.deleteMany({offer_id:{$in:offerIdList}})
        const offDel = await Offer.deleteMany({recruiter_id: uid})
        User.deleteOne({_id: uid})
        .exec()
        .then(result => {
            res.status(200).json({
                code:200,
                message : "User deleted successfully."
            });
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