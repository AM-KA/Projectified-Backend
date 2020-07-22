const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Profile = require('../models/profile');
const checkAuth = require('../middleware/check-auth');


router.post('/', checkAuth, (req, res, next) => {
    const date = new Date();
    const profile =  new Profile({
        _id: mongoose.Types.ObjectId(req.body.userID) ,
        name: req.body.name,
        date: date,
        collegeName: req.body.collegeName,
        semester: req.body.semester,
        languages: req.body.languages,
        interest1: req.body.interest1,
        interest2: req.body.interest2,
        interest3: req.body.interest3,
        hobbies: req.body.hobbies,
        description: req.body.description,
       
    });

    profile
    .save()
    .then(result => {
        res.status(200).json({
            message: "Profile Created Succesfully",
            user_id : result._id
        });
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json(err);
    });
});

/*
    This route is solely for checking purposes. Don't expose it.
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

module.exports = router;
