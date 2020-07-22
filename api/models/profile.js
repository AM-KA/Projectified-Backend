const mongoose = require('mongoose');

const profileSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name : {
        type: String,
        required : true
    },
    date : {
        type: Date,
        required : true
    },
    collegeName : {
        type: String,
        required: true
    },
    semester: {
        type: Number,
        required: true
    },

    languages: {
        type: Array,
        required: true
    },

    interest1: {
        type: String,
        required: true
    },
    interest2: {
        type: String,
        required: true
    },
    interest3: {
        type: String,
        required: true
    },
    hobbies: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },
  

});
module.exports = mongoose.model('Profile', profileSchema);


