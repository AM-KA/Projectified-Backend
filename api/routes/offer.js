const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const Offer = require('../models/offer');
const checkAuth = require('../middleware/check-auth');
const offer = require('../models/offer');

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

router.get('/:offer_id', (req, res, next) => {
    const off_id = req.params.offer_id;
    Offer.find({_id : off_id})
    .exec()
    .then(result =>{
        if(result.length >= 0){
            res.status(200).json({
                message : "Offer detail fetched successfully.",
                offer : result[0]
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
router.get('/byDomain/:domain_name', (req, res, next) => {
    const dom_name = req.params.domain_name;
    Offer.find({domain_name : dom_name})
    .exec()
    .then(result =>{
        if(result.length >= 0){
            var vals = new Array();
            for(i = 0; i<result.length; i++){
                if(result[i].is_visible){
                    vals.push({
                        offer_name: result[i].offer_name,
                        float_date: result[i].float_date,
                        offer_id: result[i]._id
                    });
                }
            }
            res.status(200).json({
                message : "Offers fetched successfully.",
                offers : vals
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
//TODO: Add college detail in offer.

module.exports = router;