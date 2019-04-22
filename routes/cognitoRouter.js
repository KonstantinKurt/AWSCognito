const express = require('express');
const router = express.Router();

const cognitoController = require('../controllers/cognitoController.js');

router.post('/signUp', cognitoController.signUp);
router.post('/signIn', cognitoController.signIn);
router.post('/decode', cognitoController.decodeToken);

module.exports = router;