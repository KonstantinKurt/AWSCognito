const express = require('express');
const router = express.Router();

const mastercardController = require('../controllers/mastercardController.js');
const enshureToken = require('../libs/enshureToken.js');
const check3DS = require('../libs/check3dsEnrollment.js');


router.put('/check3DS', mastercardController.check3DS); // Check users enrollment;
router.post('/check3DS/pay', mastercardController.payment3ds); //A single transaction to authorise the pay with 3DS check;
router.put('/check3DS/pay/refund', mastercardController.refund); //Request to refund previously captured funds to the payer.


module.exports = router;




