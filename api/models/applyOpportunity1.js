const mongoose = require('mongoose');

const applyOpportuninty1Schema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    Name : {
        type: String,
        required : true
    },
    date : {
        type: Date,
        required : true
    },
    College_name : {
        type: String,
        required: true
    },
    Semester: {
        type: Integer,
        required: true
    },

    Languages: {
        type: Array,
        required: true
    },

    Interest1: {
        type: String,
        required: true
    },
    Interest2: {
        type: String,
        required: true
    },
    Interest3: {
        type: String,
        required: true
    },
    Hobbies: {
        type: String,
        required: true
    },

    Description: {
        type: String,
        required: true
    },
  

});
module.exports = mongoose.model('MyApplication', MyApplicationSchema);


