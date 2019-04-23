const express = require('express');
const router = express.Router();

const usersController = require('../controllers/usersController.js');
const enshureToken = require('../libs/enshureToken.js');

router.post('/signUp', usersController.signUp);  //Users SignUp in Aws.Cognito endpoint;
router.post('/signIn', usersController.signIn);  //Users SignIn in Aws.Cognito endpoint;



// develop routes
router.post('/decode', usersController.decodeToken);
router.post('/token',enshureToken,usersController.testEnshureToken);


module.exports = router;