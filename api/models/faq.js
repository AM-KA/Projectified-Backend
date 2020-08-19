const mongoose = require('mongoose');

const faqSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    question: {
        type:String,
        required:true
    },
    answer: {
        type: String,
        default: "Not yet answered."
    },
    answered:{
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('FAQ', faqSchema);