const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const Offer = require('../models/offer');
const checkAuth = require('../middleware/check-auth');
const Profile = require('../models/profile');
const User = require('../models/user');
const Application = require('../models/application');
const { resource } = require('../../app');

//  CANDIDATE OPTIONS


/*
    getOffersByDomain : For Candidate CardView
    Response:   message:String
                offers:[{
                    offer_id=MongooseID
                    offer_name=String
                    skills=String
                    float_date=Date(ISO)
                    collegeName=String
                }]
*/
router.get('/:domainName', (req, res, next) => {
    const dom_name = req.params.domainName;
    Offer.find({domain_name: dom_name, is_visible: true})
    .exec()
    .then(async result => {
        var vals = Array();
        for(i=0; i<result.length; i++){
            const offer = result[i];
            const recruiterProfile = await Profile.findOne({ _id: mongoose.Types.ObjectId(offer.recruiter_id) });
            const performa = {
                offer_id: "",
                offer_name: "",
                skills: "",
                float_date:"",
                collegeName:""
            };
            performa.offer_id = offer._id;
            performa.offer_name = offer.offer_name;
            performa.skills = offer.skills;
            performa.float_date = offer.float_date;
            performa.collegeName = recruiterProfile.collegeName;
            vals.push(performa);
        }
        console.log(vals);
        res.status(200).json({
            code: 200,
            message : "Offers fetched successfully.",
            offers: vals
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
    getOfferById : Offer detail page - Candidate Version
    Response:{
        message:String
        offer:{
            requirements=String
            skills=String
            expectation=String
            recruiter_name=String
            recruiter_collegeName=String
            recruiter_course=String
            recruiter_semester=String
            recruiter_phone=String
        }
    }
*/
router.get('/:offerID/candidate', (req, res, next) => {
    const off_id = req.params.offerID;
    
    Offer.findOne({_id : mongoose.Types.ObjectId(off_id)})
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
        //console.log(performa);
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

            //console.log(performa);
            //Sending full detailed response
            const obj = {
                code: 200,
                message : "Offer detail fetched successfully.",
                offer : performa
            };
            console.log(obj);
            res.status(200).json(obj);
        }
        else{
            res.status(404).json({
                code: 404,
                message : "Not found."
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


//  RECRUITER OPTIONS


/*
    addOffer    
    Request:    offer_name
                domain_name
                requirements
                skills
                expectation
                recruiter_id

    Response    message=String
                job_id=String (MongooseID)
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
            code: 200,
            message: "Offer added successfully",
            job_id : offer._id
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
    getOffersByRecruiter (CardView)
    Response:   message:String
                offers:[{
                    offer_id
                    offer_name
                    float_date
                    no_of_applicants
                }]
*/
router.get('/recruiter/:recruiterID', checkAuth, (req, res, next) => {
    const rec_id = req.params.recruiterID;

    Offer.find({recruiter_id : mongoose.Types.ObjectId(rec_id)})
    .then(async result => {
        var vals = [];
        for(i=0; i<result.length; i++){
            const applicationArray = await Application.find({offer_id : result[i]._id});
            var performa = {
                offer_id:"",
                offer_name:"",
                float_date:"",
                no_of_applicants:""
            }
            performa.offer_id = result[i]._id;
            performa.offer_name = result[i].offer_name;
            performa.float_date = result[i].float_date;
            performa.no_of_applicants = applicationArray.length;
            vals.push(performa);
        }
        res.status(200).json({
            code: 200,
            message: "Offers fetched successfully.",
            offers : vals
        });
    })
    .catch(err=>{
        console.log(err);
        return res.status(500).json({
            code: 500,
            message: "Some error occured.",
            error: err
        });
    });
});

/*
    getOfferByIdRecruiter
    Response:   message=String
                offer:{
                    offer_id=String
                    offer_name=String
                    requirements:String
                    skills:String
                    expectation:String
                    is_visible:Boolean
                }
*/
router.get('/:offerID/recruiter', checkAuth, (req, res, next) => {
    const off_id = req.params.offerID;

    Offer.findOne({_id : mongoose.Types.ObjectId(off_id)})
    .then(result => {
        var performa = {
            offer_id:"",
            offer_name:"",
            requirements: "",
            skills:"",
            expectation:"",
            is_visible: true
        }
            performa.offer_id = result._id;
            performa.offer_name = result.offer_name;
            performa.requirements = result.requirements;
            performa.skills = result.skills;
            performa.expectation = result.expectation;
            performa.is_visible = result.is_visible;
        res.status(200).json({
            code: 200,
            message: "Offer fetched successfully.",
            offer : performa
        });
    })
    .catch(err=>{
        console.log(err);
        return res.status(500).json({
            code: 500,
            message: "Some error occured.",
            error: err
        });
    });
});



/* 
    getOfferApplicants (CARD VIEW)
    Response:   message=String
                applicants:[{
                    application_id=String
                    collegeName=String
                    is_Seen=String
                    is_Selected=String
                    date=Date(ISO)
                    applicant_id=String
                }]
*/
router.get('/:offerID/applicants', checkAuth, (req, res, next) => {
    const off_id = req.params.offerID;

    Application.find({offer_id : mongoose.Types.ObjectId(off_id)})
    .then(async result => {
        var vals = [];
        if(result){
            for(i=0; i<result.length; i++){
                var performa = {
                    application_id:"",
                    collegeName:"",
                    is_Seen:"", 
                    is_Selected:"",
                    date:"",
                    applicant_id:""
                };
                //Obtaining applicant profile  for CollegeName
                const applicantProfile = await Profile.findOne({ _id: mongoose.Types.ObjectId(result[i].applicant_id) });
                performa.application_id = result[i]._id;
                performa.collegeName = applicantProfile.collegeName;
                performa.is_Seen = result[i].is_Seen;
                performa.is_Selected = result[i].is_Selected;
                performa.date=result[i].apply_date;
                performa.applicant_id=result[i].applicant_id;
                vals.push(performa)
                console.log(performa);
            }
            res.status(200).json({
                code: 200,
                message : "Applications detail fetched successfully.",
                applicants : vals
            });
        }
        else{
            res.status(404).json({
                code: 404,
                message : "Not found."
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
    updateOffer
    Request:    offer_name=String
                requirements=String
                skills=String
                expectation=String
    Response:   message=String
*/
router.patch('/:offerID', checkAuth, (req, res, next) => {
    const off_id = req.params.offerID;
    Offer
    .updateOne({_id : mongoose.Types.ObjectId(off_id)},
    {
        offer_name:req.body.offer_name,
        requirements: req.body.requirements,
        skills: req.body.skills,
        expectation: req.body.expectation
    })
    .then(result => {
        res.status(200).json({
            code: 200,
            message : "Offer details updated successfully."
        })
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
    toggleVisibility
    Request:    visibility=Boolean
    Response:   message=String
*/
router.post('/:offerID/toggle', checkAuth, (req, res, next) => {
    const off_id = req.params.offerID;
    Offer.updateOne({ _id : off_id},
        {
            is_visible: req.body.visibility
        })
    .exec()
    .then(result =>{
        res.status(200).json({
            code: 200,
            message: "Offer visibility changed successfully."
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
    deleteOffer
    Response: message=String
*/
router.delete('/:offerID', checkAuth, (req, res, next) => {
    const off_id = req.params.offerID;
    
    Offer
    .deleteOne({_id : off_id})
    .exec()
    .then(result =>{
        res.status(200).json({
            code: 200,
            message : "Offer deleted successfully."
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

router.delete('/', (req, res, next)=>{
    Offer.deleteMany().exec()
    .then( result => {
        return res.status(200).json({message: "Done successfully!"})
    })
    .catch();
});
module.exports = router;