const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const FAQ = require('../models/faq');

/*
    getAllFaq
*/
router.get('/', (request, response, next) => {
    FAQ
    .find({answered: true})
    .then(result => {
        response.status(200).json({
            code: 200,
            message: "FAQ Items fetched successfully.",
            faqList: result
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
    postFaq
*/
router.post('/', (request, response, next) => {
    const faq = new FAQ({
        _id: mongoose.Types.ObjectId(),
        question: request.body.question,
    });

    faq
    .save()
    .then(result => {
        response.status(200).json({
            code: 200,
            message: "Item added successfully."
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
    updateFaqById
*/
router.patch('/:faqID', (request, response, next) => {
    const faq_id = request.params.faqID;

    FAQ.updateOne(
        {
            _id : mongoose.Types.ObjectId(faq_id)
        },
        {
            question: request.body.question,
            answer: request.body.answer,
            answered:request.body.answered
        })
        .exec()
        .then(result => {
            response.status(200).json({
                code: 200,
                message:"Item updated successfully."
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
    deleteFaqById
*/
router.delete('/:faqID', (request, response, next) => {
    const faq_id = request.params.faqID;

    FAQ.deleteOne({_id : mongoose.Types.ObjectId(faq_id)})
        .exec()
        .then(result => {
            response.status(200).json({
                code: 200,
                message:"Item deleted successfully."
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

router.get('/all', (request, response, next) => {
    FAQ
    .find()
    .then(result => {
        response.status(200).json({
            faqList: result
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

module.exports = router;