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
    add application
                        */

router.post('/', checkAuth, (req, res, next) => {
    const date = new Date();
    const application = new application({
        _id: mongoose.Types.ObjectId() ,
        apply_date: date,
        resume: req.body.resume,
        previousWork: req.body. previousWork,
        applicant_id:mongoose.Types.ObjectId(req.body.applicant_id),
        offer_id:mongoose.Types.ObjectId(req.body.offer_id),
        recruiter_id: mongoose.Types.ObjectId(req.body.recruiter_id)
    });
    Application.save()
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
router.patch('/:applicantionID', checkAuth, (req, res, next) => {
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
    getApplications-ByCandidate(CARD VIEW)
*/
router.get('/byApplicant/:applicantID', checkAuth, (req, res, next) => {
    const appt_id = req.params.applicantI                      //  appt =   application
    Application.find({applicant_id : appt_id})
    .then(async result  => {
        var vals = [];
        var performa = {
            offer_name:"",
            college_name:"",
            float_date: "",
            markAsSeen:"false",
            markAsSelected:"false"
           
        }
        for(i=0; i<result.length; i++){
            if(result)

           //Obtaining offer Deatils for Offer Name and Offer date
            const offer =await Offer.findOne({ _id: mongoose.Types.ObjectId(result.offer_id) });

             //Obtaining recruiter profile Recuriters CollegeName,
            const recruiterProfile = await Profile.findOne({ _id: mongoose.Types.ObjectId(result.recruiter_id) });

            performa.offer_name = offer.offer_name;
            performa.float_date=offer.float_date;
            performa.college_name=recruiterProfile.college_name;
            vals.push(performa);
        }
        res.status(200).json({
            message: " All Application  fetched successfully.",
            offers : vals
        });
    });
});

/*
    getApplictionsById : Application detail page -( (Candidate Version)
*/
router.get('/:application_id', (req, res, next) => {
    const app_id = req.params.application_id;
    
    Application.findOne({_id : app_id})
    .exec()
    .then(async result =>{
        var performa = {
            requirements: "",
            skills:"",
            markAsSeen:result.markAsSeen,
            markAsSelected:result.markAsSelected,
            expectation:"",
            recruiter_name: "",
            recruiter_collegeName:"",
            recruiter_course:"",
            recruiter_semester:"",
            recruiter_phone:"",
            previousWork:result.previousWork,
            resume:result.resume
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

   
   //  RECURUITER OPTIONS 


   /* 
       getApplicationById -Recruiter Version (CARD VIEW)
       */
 router.get('/ViewApplications/:offerID', checkAuth, (req, res, next) => {
    const off_id = req.params.offerID;

    Application.find({_id : mongoose.Types.ObjectId(off_id)})
    .then(result => {
        var performa = {
           college_name:"", 
           markAsSeen:"false",
           date:"",
           markAsSeen:"false",
        };
        for(i=0; i<result.length; i++){
            if(result){
            //Obtaining applicant profile  for CollegeNamea
            const applicantProfile = await Profile.findOne({ _id: mongoose.Types.ObjectId(result.applicant_id) });
                performa.college_name = applicantProfile.college_name;
                performa.date=result.apply_date;
                vals.push(performa);
            
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
            }
        })
            .catch(err => {
                console.log(err);
                return res.status(500).json(err);
            });


    /*
    Seen As Marked
*/
router.post('/SeenMarked/:applicant_id', checkAuth, (req, res, next) => {
    const app_id = req.params.applicant_id;
    Offer.updateOne({ _id : app_id},
        {
            markAsSeen: req.body.markedSeen
        })
    .exec()
    .then(result =>{
        res.status(200).json({
            message: "Offer had been seen."
        });
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json(err);
    });
});