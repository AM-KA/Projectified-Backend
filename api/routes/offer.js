const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const Offer = require('../models/offer');
const checkAuth = require('../middleware/check-auth');
const Profile = require('../models/profile');
const User = require('../models/user');
const { resource } = require('../../app');

//  CANDIDATE OPTIONS


/*
    getOfferByDomain : For Candidate CardView
*/
router.get('/byDomain/:domain_name', (req, res, next) => {
    const dom_name = req.params.domain_name;
    var performa = {
        offer_id: "",
        offer_name: "",
        skills: "",
        float_date:"",
        collegeName:""
    };


    Offer.find({domain_name: dom_name})
    .exec()
    .then(async result => {
        var vals = [];
        for(i=0; i<result.length; i++){
            const offer = result[i];
            const recruiterProfile = await Profile.findOne({ _id: mongoose.Types.ObjectId(offer.recruiter_id) });
            performa.offer_id = offer._id;
            performa.offer_name = offer.offer_name;
            performa.skills = offer.skills;
            performa.float_date = offer.float_date;
            performa.collegeName = recruiterProfile.collegeName;
            vals.push(performa);
        }
        res.status(200).json({
            message : "Offers fetched successfully.",
            offers: vals
        });
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json(err);
    });

});


/*
    getOfferById : Offer detail page - Candidate Version
*/
router.get('/:offer_id', (req, res, next) => {
    const off_id = req.params.offer_id;
    
    Offer.findOne({_id : off_id})
    .exec()
    .then(async result =>{
        var performa = {
            requirements: result.requirements,
            skills:result.skills,
            expectation:result.expectation,
            recruiter_name: "",
            recruiter_collegeName:"",
            recruiter_course:"",
            recruiter_semester:"",
            recruiter_phone:""
        };
        if(result){
            //Obtaining recruiter profile for Name, CollegeName, Course and Semester
            const recruiterProfile = await Profile.findOne({ _id: mongoose.Types.ObjectId(result.recruiter_id) });

            //Obtaining Recruiter User detail for Phone Number
            const recruiterUser = await User.findOne({ _id: mongoose.Types.ObjectId(result.recruiter_id) });

            //Setting Recruiter details
            performa.recruiter_name = recruiterProfile.name;
            performa.recruiter_collegeName = recruiterProfile.collegeName;
            performa.recruiter_course = recruiterProfile.course;
            performa.recruiter_semester = recruiterProfile.semester;
            performa.recruiter_phone = recruiterUser.phone;

            //Sending full detailed response
            res.status(200).json({
                message : "Offer detail fetched successfully.",
                offer : performa
            });
        }
        else{
            res.status(404).json({
                message : "Not found."
            });
        }
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json(err);
    });
});


//  RECRUITER OPTIONS


/*
    addOffer
*/
router.post('/', checkAuth, (req, res, next) => {
    const date = new Date();
    const offer = new Offer({
        _id: mongoose.Types.ObjectId() ,
        float_date: date,
        offer_name: req.body.offer_name,
        domain_name: req.body.domain_name,
        requirements: req.body.requirements,
        skills: req.body.skills,
        expectation: req.body.expectation,
        recruiter_id: mongoose.Types.ObjectId(req.body.recruiter_id)
    });
    offer.save()
    .then(result => {
        res.status(200).json({
            message: "Offer added successfully",
            job_id : offer._id
        });
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json(err);
    });
});

/*
    getOffersByRecruiter
*/
router.get('/byRecruiter/:recruiterID', checkAuth, (req, res, next) => {
    const rec_id = req.params.recruiterID;

    Offer.find({recruiter_id : rec_id})
    .then(result => {
        var vals = [];
        var performa = {
            offer_id:"",
            requirements: "",
            skills:"",
            expectation:"",
            is_visible: true
        }
        for(i=0; i<result.length; i++){
            performa.offer_id = result[i]._id;
            performa.requirements = result[i].requirements;
            performa.skills = result[i].skills;
            performa.expectation = result[i].expectation;
            performa.is_visible = result[i].is_visible;
            vals.push(performa);
        }
        res.status(200).json({
            message: "Offers fetched successfully.",
            offers : vals
        });
    });
});

/*
    getOffersByIdRecruiter
*/
router.get('/byIdRecruiter/:offerID', checkAuth, (req, res, next) => {
    const off_id = req.params.offerID;

    Offer.findOne({_id : mongoose.Types.ObjectId(off_id)})
    .then(result => {
        var performa = {
            offer_id:"",
            requirements: "",
            skills:"",
            expectation:"",
            is_visible: true
        }
            performa.offer_id = result._id;
            performa.requirements = result.requirements;
            performa.skills = result.skills;
            performa.expectation = result.expectation;
            performa.is_visible = result.is_visible;
        res.status(200).json({
            message: "Offers fetched successfully.",
            offers : performa
        });
    });
});


/*
    updateOffer
*/
router.patch('/:offerID', checkAuth, (req, res, next) => {
    const off_id = req.params.offerID;
    Offer
    .updateOne({_id : mongoose.Types.ObjectId(off_id)},
    {$set : {
        offer_name: req.body.offer_name,
        requirements: req.body.requirements,
        skills: req.body.skills,
        expectation: req.body.expectation
    }})
    .then(result => {
        res.status(200).json({
            message : "Offer details updated successfully."
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json(err);
    });
});


/*
    toggleVisibility
*/
router.post('/toggle/:offer_id', checkAuth, (req, res, next) => {
    const off_id = req.params.offer_id;
    Offer.updateOne(
        {
            _id : off_id
        },
        {
            is_visible: req.body.visibility
        })
    .exec()
    .then(result =>{
        res.status(200).json({
            message: "Offer visibility changed successfully."
        });
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json(err);
    });
});


/*
    deleteOffer
*/
router.delete('/:offer_id', checkAuth, (req, res, next) => {
    const off_id = req.params.offer_id;
    
    Offer
    .remove({_id : off_id})
    .exec()
    .then(result =>{
        res.status(200).json({
            message : "Offer deleted successfully."
        });
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json(err);
    });
});


// MASTER OPTIONS


/*
    getAllOffers : This route is solely for checking purposes. Do not expose it.
*/
router.get('/', (req, res, next) => {
    Offer.find()
    .exec()
    .then(result => {
        res.status(200).json(result);
    });
});

module.exports = router;