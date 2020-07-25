const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const Application = require('../models/application');
const checkAuth = require('../middleware/check-auth');
const Profile = require('../models/profile');
const User = require('../models/user');
const Offer = require('../models/offer')
const { resource } = require('../../app');


//CANDIDATE OPTIONS 


/*
    addApplication
*/

router.post('/', checkAuth, (req, res, next) => {
    const date = new Date();
    const application = new Application({
        _id: mongoose.Types.ObjectId() ,
        apply_date: date,
        resume: req.body.resume,
        previousWork: req.body. previousWork,
        applicant_id:mongoose.Types.ObjectId(req.body.applicant_id),
        offer_id:mongoose.Types.ObjectId(req.body.offer_id),
        recruiter_id: mongoose.Types.ObjectId(req.body.recruiter_id)
    });

    application.save()
    .then(result => {
        res.status(200).json({
            message: "Applied successfully",
            apply_id : application._id
        });
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json(err);
    });
});


/*
    updateApplication
*/
router.patch('/:applicationID', checkAuth, (req, res, next) => {
    const app_id = req.params.applicationID;
    Application
    .updateOne({_id : mongoose.Types.ObjectId(app_id)},
    {$set : {

        resume: req.body.resume,
        previousWork: req.body.previousWork,
       
    }})
    .then(result =>{
        res.status(200).json({
            message : "Application details updated successfully."
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json(err);
    });
});


/*
    deleteApplication
*/
router.delete('/:application_id', checkAuth, (req, res, next) => {
    const app_id = req.params.application_id;
    
    Application
    .remove({_id : app_id})
    .exec()
    .then(result =>{
        res.status(200).json({
            message : "Application deleted successfully."
        });
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json(err);
    });
});


/*
    getApplicationsByCandidate(CARD VIEW)
*/
router.get('/byApplicant/:applicantID', checkAuth, (req, res, next) => {
    const appt_id = req.params.applicantID                   //  appt =   applicant
    Application.find({applicant_id : appt_id})
    .then(async result  => {
        var vals = [];
        var performa = {
            offer_name:"",
            application_id:"",
            college_name:"",
            float_date: "",
            is_Seen:"",
            is_Selected:""
        }
        for(i=0; i<result.length; i++){
           //Obtaining offer Details for Offer Name and Offer date
            const offer =await Offer.findOne({ _id: mongoose.Types.ObjectId(result[i].offer_id) });

             //Obtaining recruiter profile Recuriters CollegeName,
            const recruiterProfile = await Profile.findOne({ _id: mongoose.Types.ObjectId(result[i].recruiter_id) });

            performa.offer_name = offer.offer_name;
            performa.float_date = offer.float_date;
            performa.application_id = result[i]._id;
            performa.college_name = recruiterProfile.college_name;
            performa.is_Seen = result[i].is_Seen;
            performa.is_Selected = result[i].is_Selected;
            vals.push(performa);
        }
        res.status(200).json({
            message: " All Application  fetched successfully.",
            applications : vals
        });
    });
});


/*
    getApplicationByIdCandidate
*/
router.get('/:application_id', (req, res, next) => {
    const app_id = req.params.application_id;
    
    Application.findOne({_id : app_id})
    .exec()
    .then(async result =>{
        var performa = {
            requirements: "",
            skills:"",
            markAsSeen: result.markAsSeen,
            markAsSelected: result.markAsSelected,
            expectation:"",
            recruiter_name: "",
            recruiter_collegeName:"",
            recruiter_course:"",
            recruiter_semester:"",
            recruiter_phone:"",
            previousWork: result.previousWork,
            resume: result.resume
        };
        if(result){
            //Obtaining recruiter profile for Name, CollegeName, Course and Semester
            const recruiterProfile = await Profile.findOne({ _id: mongoose.Types.ObjectId(result.recruiter_id) });

            //Obtaining Recruiter User detail for Phone Number
            const recruiterUser = await User.findOne({ _id: mongoose.Types.ObjectId(result.recruiter_id) });

           //Obtaining Offers Details for reqirements and  Skills
           const offer = await Offer.findOne({ _id: mongoose.Types.ObjectId(result.offer_id) });

            //Setting Recruiter details
            performa.requirements=offer.requirements;
            performa.skills=offer.skills;
            performa.expectation=offer.expectation;
            performa.recruiter_name = recruiterProfile.name;
            performa.recruiter_collegeName = recruiterProfile.collegeName;
            performa.recruiter_course = recruiterProfile.course;
            performa.recruiter_semester = recruiterProfile.semester;
            performa.recruiter_phone = recruiterUser.phone;

            //Sending full detailed response
            res.status(200).json({
                message : "Application detail fetched successfully.",
                application : performa
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
    getApplicationById
*/
router.get('/byIdRecruiter/:application_id/', (req, res, next) => {
    const app_id = req.params.application_id;
    
    Application.findOne({_id : app_id})
    .exec()
    .then(async result =>{
        var performa = {
            markAsSeen: result.markAsSeen,
            markAsSelected: result.markAsSelected,
            applicant_name: "",
            applicant_collegeName:"",
            applicant_course:"",
            applicant_semester:"",
            applicant_phone:"",
            previousWork: result.previousWork,
            resume: result.resume
        };
        if(result){
            //Obtaining recruiter profile for Name, CollegeName, Course and Semester
            const applicantProfile = await Profile.findOne({ _id: mongoose.Types.ObjectId(result.applicant_id) });

            //Obtaining Recruiter User detail for Phone Number
            const applicantUser = await User.findOne({ _id: mongoose.Types.ObjectId(result.applicant_id) });

           //Obtaining Offers Details for reqirements and  Skills
           const offer = await Offer.findOne({ _id: mongoose.Types.ObjectId(result.offer_id) });

            //Setting Recruiter details
            performa.applicant_name = applicantProfile.name;
            performa.applicant_collegeName = applicantProfile.collegeName;
            performa.applicant_course = applicantProfile.course;
            performa.applicant_semester = applicantProfile.semester;
            performa.applicant_phone = applicantUser.phone;

            //Sending full detailed response
            res.status(200).json({
                message : "Application detail fetched successfully.",
                application : performa
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


/*
    markSeen
*/
router.patch('/markSeen/:application_id', checkAuth, (req, res, next) => {
    const app_id = req.params.application_id;

    Application.findOne({ _id : app_id})
    .exec()
    .then(result =>{
        const seen=result.is_seen;

        if(seen == "false")
        { 
            Application.updateOne({ _id : app_id},
            {
                is_seen: req.body.markedSeen
            })
            .exec()
            .then(result =>{
                res.status(200).json({
                    message: "Seen Marked successfully."
                });
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
    markSelected
*/
router.patch('/markSelected/:application_id', checkAuth, (req, res, next) => {
    const app_id = req.params.application_id;

    Application.findOne({ _id : app_id})
    .exec()
    .then(async result =>{
        const selected=result.is_selected;
    
        if(selected == "false")
        { 
            await Application.updateOne({ _id : app_id},
            {
                is_selected: req.body.markedSelected
            })
            .exec()
            .then(result =>{
                res.status(200).json({
                    message: "Selected Marked successfully."
                });
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



//MASTER OPTIONS


/*
    getAllApplications
*/
router.get('/', (req, res, next) => {
    
    Application.find()
    .exec()
    .then(async result =>{
        var performa = {
            requirements: "",
            skills:"",
            markAsSeen: result.markAsSeen,
            markAsSelected: result.markAsSelected,
            expectation:"",
            recruiter_name: "",
            recruiter_collegeName:"",
            recruiter_course:"",
            recruiter_semester:"",
            recruiter_phone:"",
            previousWork: result.previousWork,
            resume: result.resume
        };
        if(result){
            var vals = [];
            for(i=0; i<result.length; i++){

                //Obtaining recruiter profile for Name, CollegeName, Course and Semester
                const recruiterProfile = await Profile.findOne({ _id: mongoose.Types.ObjectId(result.recruiter_id) });

                //Obtaining Recruiter User detail for Phone Number
                const recruiterUser = await User.findOne({ _id: mongoose.Types.ObjectId(result.recruiter_id) });

                //Obtaining Offers Details for reqirements and  Skills
                const offer = await Offer.findOne({ _id: mongoose.Types.ObjectId(result.offer_id) });

                //Setting Recruiter details
                performa.requirements=offer.requirements;
                performa.skills=offer.skills;
                performa.expectation=offer.expectation;
                performa.recruiter_name = recruiterProfile.name;
                performa.recruiter_collegeName = recruiterProfile.collegeName;
                performa.recruiter_course = recruiterProfile.course;
                performa.recruiter_semester = recruiterProfile.semester;
                performa.recruiter_phone = recruiterUser.phone;

                vals.push(performa);
            }
            //Sending full detailed response
            res.status(200).json({
                message : "Application detail fetched successfully.",
                applications : vals
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


module.exports = router;  
