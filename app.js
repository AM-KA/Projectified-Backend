const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const userRoutes = require('./api/routes/user');
const offerRoutes = require('./api/routes/offer');
const userProfileRoutes=require('./api/routes/profile');
const applicationRoutes=require('./api/routes/application')
const faqRoutes = require('./api/routes/faq');

mongoose.connect(
    'mongodb+srv://dbUser:abcd1234@projectified.kcttx.mongodb.net/<dbname>?retryWrites=true&w=majority',
    {
        useNewUrlParser:true,
        useUnifiedTopology:true
    }
);

mongoose.Promise = global.Promise;

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());

app.use((req, res, next)=>{
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Origin',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    if(req.method==='OPTIONS'){
        res.header(
            'Access-Control-Allow-Methods',
            'PUT, POST, PATCH, DELETE, GET'  
        );

        return res.status(200).json({});
    }
    next();
});

app.use('/application', applicationRoutes);
app.use('/profile', userProfileRoutes)
app.use('/user', userRoutes);
app.use ('/offer', offerRoutes);
app.use('/faq', faqRoutes);

app.use((req, res, next)=> {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {

    res.status(error.status || 500);
    res.json({
        message: error.message
    });

});
module.exports = app;