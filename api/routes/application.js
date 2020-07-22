const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const Offer = require('../models/offer');
const checkAuth = require('../middleware/check-auth');

module.exports = router;