const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: {
        type:String,
        required:true,
        unique: true
    },
    password: {
        type: String,
        required:true
    },
    phone: {
        type: Number,
        required: true
    },
    name : {
        type: String,
        //required : true
    },
    date : {
        type: Date,
        //required : true
    },
    collegeName : {
        type: String,
        //required: true
    },
    course: {
        type: String,
        //required: true
    },
    semester: {
        type: Number,
        //required: true
    },

    languages: {
        type: Array,
        //required: true
    },

    interest1: {
        type: String,
        //required: true
    },
    interest2: {
        type: String,
        //required: true
    },
    interest3: {
        type: String,
        //required: true
    },
    hobbies: {
        type: String,
        //required: true
    },
    description: {
        type: String,
        //required: true
    },
    profileCompleted:{
        type:Boolean,
        required: true
    },
    resetRequestTimestamp:{
        type:Date,
        default:Date.now()
    },
    resetRequestAccepted:{
        type:Boolean,
        default:false
    },
    resetOtp:{
        type:String
    }
});

module.exports = mongoose.model('User', userSchema);