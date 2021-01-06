const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const Application = require('../models/application');
const checkAuth = require('../middleware/check-auth');
const User = require('../models/user');
const Offer = require('../models/offer');
const checkAuthAdmin = require('../middleware/check-auth-admin');


//CANDIDATE OPTIONS 


/*
    addApplication
*/

router.post('/', checkAuth, (req, res, next) => {
    const date = new Date();
    const applicant_idC=mongoose.Types.ObjectId(req.body.applicant_id); // Creating offer_idC and applicant_idC for Checking
    const offer_idC =mongoose.Types.ObjectId(req.body.offer_id);

    const application = new Application({
        _id: mongoose.Types.ObjectId() ,
        apply_date: date,
        resume: req.body.resume,
        previousWork: req.body. previousWork,
        applicant_id:mongoose.Types.ObjectId(req.body.applicant_id),
        offer_id:mongoose.Types.ObjectId(req.body.offer_id)

    });

    Offer.find({_id: offer_idC, recruiter_id: applicant_idC})
    .then(result=>{
        if(result.length>0){
            res.status(201).json({
                message:"You cannot apply for an offer floated by yourself.",
                code:201
            });
        }else{
            Application.find({offer_id :offer_idC , applicant_id:applicant_idC} )
            .then(async result => {
                if(result.length>0){
                    res.status(201).json({
                        message:"You have already applied for this opportunity. Check the status of your application in the 'My Applications' tab.",
                        code:201
                    })
                }
                else{
                    console.log(application);
                    application.save()
                    .then(result => {
                        res.status(200).json({
                            message: "You have applied successfully for this opportunity.",
                            code:200
                        });
                    })
                }
            })
        }
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
            code:200,
            message : "Your application was updated successfully."
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
router.delete('/:applicationID', checkAuth, (req, res, next) => {
    const app_id = req.params.applicationID;
    
    Application
    .deleteOne({_id :  mongoose.Types.ObjectId(app_id)})
    .exec()
    .then(result =>{
        res.status(200).json({
            code:200,
            message : "Your application was deleted successfully."
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
    Application.find({applicant_id :  mongoose.Types.ObjectId(appt_id)})
    .then(async result  => {
        var vals = [];
        console.log(result)
        for(i=0; i<result.length; i++){
           //Obtaining offer Details for Offer Name and Offer date
            const offer =await Offer.findOne({ _id: mongoose.Types.ObjectId(result[i].offer_id) });

             //Obtaining recruiter user document for Recruiter's CollegeName,
            const recruiter = await User.findOne({ _id: mongoose.Types.ObjectId(offer.recruiter_id) });
            
            var performa = {
                offer_name:"",
                recruiter_name:"",
                application_id:"",
                collegeName:"",
                float_date: "",
                is_Seen:"",
                is_Selected:""
            }

            performa.offer_name = offer.offer_name;
            performa.recruiter_name = recruiter.name;
            performa.float_date = offer.float_date;
            performa.application_id = result[i]._id;
            performa.collegeName = recruiter.collegeName;
            performa.is_Seen = result[i].is_Seen;
            performa.is_Selected = result[i].is_Selected;
            vals.push(performa);
        }
        res.status(200).json({
            code: 200,
            message: " All Applications fetched successfully.",
            applications : vals
        });
    });
}); 


/*
    getApplicationByIdCandidate
*/
router.get('/:applicationID', (req, res, next) => {
    const app_id = req.params.applicationID;
    
    Application.findOne({_id :  mongoose.Types.ObjectId(app_id)})
    .exec()
    .then(async result =>{
        var performa = {
            requirements: "",
            skills:"",
            is_Seen: result.is_Seen,
            is_Selected: result.is_Selected,
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
            //Obtaining Offers Details for reqirements and  Skills
            const offer = await Offer.findOne({ _id: mongoose.Types.ObjectId(result.offer_id) });

            //Obtaining recruiter user document for Name, CollegeName, Course and Semester
            const recruiter = await User.findOne({ _id: mongoose.Types.ObjectId(offer.recruiter_id) });

            //Setting Recruiter details
            performa.requirements=offer.requirements;
            performa.skills=offer.skills;
            performa.expectation=offer.expectation;
            performa.recruiter_name = recruiter.name;
            //performa.recruiter_name = "AK";
            performa.recruiter_collegeName = recruiter.collegeName;
            performa.recruiter_course = recruiter.course;
            performa.recruiter_semester = recruiter.semester;
            performa.recruiter_phone = recruiter.phone;

            //Sending full detailed response
            res.status(200).json({
                code:200,
                message : "Application details were fetched successfully.",
                application : performa
            });
        }
        else{
            res.status(404).json({
                code:404,
                message : "The requested data was not found."
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
router.get('/:applicationID/recruiter', (req, res, next) => {
    const app_id = req.params.applicationID;
    
    Application.findOne({_id :  mongoose.Types.ObjectId(app_id)})
    .exec()
    .then(async result =>{
        if(result){
            var performa = {
                is_Seen: result.is_Seen,
                is_Selected: result.is_Selected,
                applicant_name: "",
                applicant_collegeName:"",
                applicant_course:"",
                applicant_semester:"",
                applicant_phone:"",
                previousWork: result.previousWork,
                resume: result.resume
            };

            //Obtaining applicant user document for Name, CollegeName, Course and Semester
            const applicant = await User.findOne({ _id: mongoose.Types.ObjectId(result.applicant_id) });

            //Setting Applicant details
            performa.applicant_name = applicant.name;
            performa.applicant_collegeName = applicant.collegeName;
            performa.applicant_course = applicant.course;
            performa.applicant_semester = applicant.semester;
            performa.applicant_phone = applicant.phone;

            console.log(performa);
            //Sending full detailed response
            res.status(200).json({
                code:200,
                message : "Application details were fetched successfully.",
                application : performa
            });
        }
        else{
            res.status(404).json({
                code:404,
                message : "The requested data was not found."
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
router.patch('/:applicationID/seen', checkAuth, (req, res, next) => {
    const app_id = req.params.applicationID;

    Application
    .findOne({ _id :  mongoose.Types.ObjectId(app_id)})
    .exec()
    .then(result =>{
        const seen=result.is_Seen;

        if(seen === false)
        { 
            Application
            .updateOne({ 
                _id : mongoose.Types.ObjectId(app_id)
            },
            {
                is_Seen: req.body.is_Seen
            })
            .exec()
            .then(result =>{
                res.status(200).json({
                    code:200,
                    message: "The application was marked as seen successfully."
                });
            })
            .catch(err => {
                console.log(err);
                return res.status(500).json(err);
            });
        } else{
            res.status(200).json({
                code:200,
                message: "The application has already been marked as seen."
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
router.patch('/:applicationID/selected', checkAuth, (req, res, next) => {
    const app_id = req.params.applicationID;

    Application.findOne({ _id : mongoose.Types.ObjectId(app_id)})
    .exec()
    .then(async result =>{
        const selected=result.is_Selected;
    
        if(selected === false)
        { 
            await Application.updateOne({ _id :  mongoose.Types.ObjectId(app_id)},
            {
                is_Selected: req.body.is_Selected
            })
            .exec()
            .then(result =>{
                res.status(200).json({
                    code:200,
                    message: "The application was marked as selected successfully."
                });
            })
            .catch(err => {
                console.log(err);
                return res.status(500).json(err);
            });        
        }else{
            res.status(200).json({
                code:200,
                message: "The candidate has already been selected."
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
router.get('/', checkAuthAdmin, (req, res, next) => {
    
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

                //Obtaining recruiter user document for Name, CollegeName, Course and Semester
                const recruiter = await User.findOne({ _id: mongoose.Types.ObjectId(result.recruiter_id) });

                //Obtaining Offers Details for reqirements and  Skills
                const offer = await Offer.findOne({ _id: mongoose.Types.ObjectId(result.offer_id) });

                //Setting Recruiter details
                performa.requirements=offer.requirements;
                performa.skills=offer.skills;
                performa.expectation=offer.expectation;
                performa.recruiter_name = recruiter.name;
                performa.recruiter_collegeName = recruiter.collegeName;
                performa.recruiter_course = recruiter.course;
                performa.recruiter_semester = recruiter.semester;
                performa.recruiter_phone = recruiter.phone;

                vals.push(performa);
            }
            //Sending full detailed response
            res.status(200).json({
                message : "All applications were fetched successfully.",
                code:200,
                applications : vals
            });
        }
        else{
            res.status(404).json({
                code:200,
                message : "The requested data was not found."
            });
        }
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json(err);
    });
});

module.exports = router;  