const mongoose = require('mongoose');

const ratingSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    rating_date : {
        type: Date,
        required : true
        
    },  
    rating:{

         type: Integer,
         required:true
        },

    any_suggestions : {

           type:String,
           required:true
    } ,   
      applicant_id:   mongoose.Schema.Types.ObjectId,
    });


    module.exports = mongoose.model('Ratings', ratingSchema);