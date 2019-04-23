const express = require('express');
const router = express.Router();

const mastercardController = require('../controllers/mastercardController.js');
const enshureToken = require('../libs/enshureToken.js');

router.post('/payment',enshureToken, mastercardController.payment);  //A single transaction to authorise the payment and transfer funds from the payer's account to your account.


module.exports = router;