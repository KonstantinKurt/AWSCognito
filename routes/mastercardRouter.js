const express = require('express');
const router = express.Router();

const mastercardController = require('../controllers/mastercardController.js');
const enshureToken = require('../libs/enshureToken.js');
const check3DS = require('../libs/check3dsEnrollment.js');

//router.put('/payment',enshureToken, mastercardController.payment);  //A single transaction to authorise the payment and transfer funds from the payer's account to your account.
router.put('/payment/refund',enshureToken, mastercardController.refund); //Request to refund previously captured funds to the payer.
router.put('/payment',enshureToken,check3DS,mastercardController.payment);



//dev routes
router.put('/check3DS', mastercardController.check3DS);

module.exports = router;




