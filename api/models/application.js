const mongoose = require('mongoose');

const applicationSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    apply_date : {
        type: Date,
        required : true
    },  
    previousWork: {
        type: String,
        required: true
    },
    resume: {
        type: String,
        required: true
    },
    is_Seen:{

        type: Boolean,
        default:false
    
    },
    is_Selected:{

        type: Boolean,
        default:false
    
    },  
    offer_id:   mongoose.Schema.Types.ObjectId,
    applicant_id:   mongoose.Schema.Types.ObjectId,
    recruiter_id : mongoose.Schema.Types.ObjectId,
});

module.exports = mongoose.model('Application', applicationSchema);


