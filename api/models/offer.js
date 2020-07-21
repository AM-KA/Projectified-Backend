const mongoose = require('mongoose');

const offerSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    float_date : {
        type: Date,
        required : true
    },
    offer_name : {
        type: String,
        required: true
    },
    domain_name: {
        type: String,
        required: true
    },
    requirements: {
        type: String,
        required: true
    },
    skills: {
        type: String,
        required: true
    },
    expectation: {
        type: String,
        required: true
    },
    recruiter_id : mongoose.Schema.Types.ObjectId,
    is_visible:{
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('Offer', offerSchema);