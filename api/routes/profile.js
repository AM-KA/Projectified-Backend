const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Profile = require('../models/profile');
const checkAuth = require('../middleware/check-auth');

/*
    createProfile
*/
router.post('/', checkAuth, (req, res, next) => {
    const date = new Date();
    const profile =  new Profile({
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
    console.log(profile);
    profile
    .save()
    .then(result => {
        res.status(200).json({
            message: "Profile Created Succesfully",
            profile_id : result._id
        });
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json(err);
    });
});

/*
    updateProfile
*/
router.patch('/:profileID', checkAuth, (req, res, next) => {
    const profileID = req.params.profileID;

    Profile.updateOne(
        {_id : mongoose.Types.ObjectId(profileID)},
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
            }
        }
    )
    .exec()
    .then(result => {
        res.status(200).json({
           message: "Profile updated successfully." 
        });
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json(err);
    });
});

/*
    getProfileById
*/
router.get('/:profileID', (req, res, next) => {
    const profileID = req.params.profileID;

    Profile.findOne({_id : mongoose.Types.ObjectId(profileID)})
    .exec()
    .then(result => {
        if(result){
            res.status(200).json(result);
        }
        else{
            res.status(404).json({
                message: "Not found!"
            });
        }
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json(err);
    });
});



//  MASTER OPTIONS


/*
    getAllProfiles : This route is solely for checking purposes. Don't expose it.
*/
router.get('/', (req, res, next) => {
    Profile
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
    deleteAllProfiles : This route is solely for checking purposes. Don't expose it.
*/
router.delete('/', checkAuth, (req, res, next) => {
    Profile.deleteMany().exec()
    .then(result => {
        res.status(200).json({message : "Delete success"});
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error:err
        });
    });
});

/*
    deleteProfileById : This route is solely for checking purposes. Don't expose it.
*/
router.delete("/:userId", checkAuth, (req, res, next) => {
    Profile.remove({_id: req.params.userId})
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
