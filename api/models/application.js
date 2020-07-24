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
    markAsSeen:{

        boolean:false,
        default:true
    
    },
    markAsSelected:{

        boolean:false,
        default:true
    
    },

    
  offer_id:   mongoose.Schema.Types.ObjectId,
    applicant_id:   mongoose.Schema.Types.ObjectId,
    recruiter_id : mongoose.Schema.Types.ObjectId,
   
    
});

module.exports = mongoose.model('Application', applicationSchema);


