const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const Application = require('../models/application');
const checkAuth = require('../middleware/check-auth');
const Profile = require('../models/profile');
const User = require('../models/user');
const Offer = require('../models/offer')
const Ratings = require('../models/ratings')

/*
    addRating
*/
router.post('/', checkAuth, (req, res, next) => {
    const date = new Date();
    const ratings= new Ratings({
        _id: mongoose.Types.ObjectId(),
        applicant_id:req.body.applicant_id,
        rating_date: date,
        rating: req.body.rating,
        any_suggestions:req.body.any_suggestions
       
    });
    Ratings.save()
    .then(result => {
        res.status(200).json({
            message: "Rating given Succesfully",
            apply_id : application._id
        });
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json(err);
    });
});


/*
    getAllRatings
*/
router.get('/', checkAuth, (req, res, next) => {

    Ratings.find().
    exec()
    .then(async result => {
        var vals = [];
        var performa = {
            rating_date:"",
            rating: "",
            any_suggestions:"",
            
        }
        for(i=0; i<result.length; i++){
            performa.rating_date = result[i]._id;
            performa.rating = result[i].rating;
            performa.any_suggestions= result[i].any_suggestions;
           
            vals.push(performa);
        }
        res.status(200).json({
            message: "Ratings fetched successfully.",
            offers : vals
        });
    });
});

/*
    updateRating
*/
router.patch('/:ratingID', checkAuth, (req, res, next) => {
    const rating_id = req.params.ratingID;
    
    Ratings
    .updateOne({_id : mongoose.Types.ObjectId(rating_id)},
    {$set : {
        rating: req.body.rating,
        any_suggestions: req.body.any_suggestions

    }})
    .then(result => {
        res.status(200).json({
            message : "Rating updated successfully."
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json(err);
    });
});

module.exports = router;