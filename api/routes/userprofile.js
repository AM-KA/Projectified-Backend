const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Profile = require('../models/Profile');
const checkAuth = require('../middleware/check-auth');


router.post('/', checkAuth, (req, res, next) => {
    const date = new Date();
    const Profile =  newProfile({
        _id: mongoose.Types.ObjectId(req.body.recruiter_id) ,
        Name: req.body.Name,
        Date: date,
        College_Name: req.body.College_Name,
        Semester: req.body.Semester,
        Languages: req.body.Languages,
        Interest1: req.body.Interest1,
        Interest2: req.body.Interest2,
        Interest3: req.body.Interest3,
        Hobbies: req.body.Hobbies,
        Description: req.body.Description,
       
    });
    Profile.save()
    .then(result => {
        res.status(200).json({
            message: "Profile Created Succesfully",
            user_id : Profile._id
        });
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json(err);
    });
});
