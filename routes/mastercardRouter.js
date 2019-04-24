const express = require('express');
const router = express.Router();

const mastercardController = require('../controllers/mastercardController.js');
const enshureToken = require('../libs/enshureToken.js');

router.put('/payment',enshureToken, mastercardController.payment);  //A single transaction to authorise the payment and transfer funds from the payer's account to your account.
router.put('/payment/refund',enshureToken, mastercardController.refund); //Request to refund previously captured funds to the payer.

module.exports = router;




// db.getCollection('test')
//     .find({ "treatments":  {$exists: true, $ne: [], $elemMatch: {  "treatment_1_1": {$exists: true }, "treatment_1_1":true,} },
//         "cost":  {$exists: true, $ne: [], $elemMatch: { "cost_treatment_1_1": {$exists: true, $gte: "10", $lte: "500"} }}})
//     .sort({ "cost.0.cost_treatment_1_1": 1 })
//     .collation({locale: "en_US", numericOrdering: true})
// db.test.find( { treatments: { $elemMatch: { treatment_1_1: true } } },
//     { cost: { $elemMatch: { cost_treatment_1_1: { $gte: "10", $lte: "500" } } } } )