const amazonCognitoIdentity = require('amazon-cognito-identity-js');
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const poolData = {
    UserPoolId: process.env.USER_POOL_ID,
    ClientId: process.env.CLIENT_ID
};
const userPool = new amazonCognitoIdentity.CognitoUserPool(poolData);

module.exports = {
    signUp: async function (req, res) {
        const password = req.body.password;
        const emailData = {
            Name: `email`,
            Value: req.body.email
        };
        const emailAttribute = new amazonCognitoIdentity.CognitoUserAttribute(emailData);
        userPool.signUp(req.body.email, password, [emailAttribute], null, (err, data) => {
            if (err) return console.log(err);
            res.status(201).json({message: `user saved`, data: data.user});
        });
    },
    signIn: async function (req, res) {
        const loginDetails = {
            Username: req.body.email,
            Password: req.body.password
        };
        const autheficationDetails = new amazonCognitoIdentity.AuthenticationDetails(loginDetails);
        const userDetails = {
            Username: req.body.email,
            Pool: userPool
        };
        const cognitoUser = new amazonCognitoIdentity.CognitoUser(userDetails);
        cognitoUser.authenticateUser(autheficationDetails, {
            onSuccess: data => {
                console.log('access token + ' + data.getAccessToken().getJwtToken());
                res.status(202).json({message: `authefication succesful`, data: data});
            },
            onFailure: err => {
                console.log(err);
            }
        })
    },
    decodeToken: async function (req, res) {
        const token = req.body.token;
        const jwk = {
            "alg": "RS256",
            "e": "AQAB",
            "kid": "Vn/VUhKUkpi80Z1oFyRSqEsj4Gp3tAoicYgf6qtPu4k=",
            "kty": "RSA",
            "n": "rDRWELU5Z9d0H9Qos4vVSf0gpUqCL9xnYyOvjIGG13VHFILufzIre4N9enZLuj86cmg2jvb-6ZNsx_HJ7R8deYLwi6Ymr6LvWjgjT5diQhG2dHTD5dRRcOrAM3veCaN7KWQkRm3Ntc2tvLVUzv41ST_5ksYnnFQj-5g0gCwSn1exdcYHpaSazhWFikr2TsxvHx7exRjxhWd-lsuc0IctNA2LuEPrt8MmMZXw12aXLQFsXgr-ekUHiDFJTduWqv8Nh3Rk8u9FJvcaXY6SzFcEq1N5zgJdcuw8SC7_HDZL97Zg--WPUm8XwHL7skVK_go4nbegM57XAD2_y7v5-LH9TQ",
            "use": "sig"
        };
        const pem = jwkToPem(jwk);
        jwt.verify(token, pem, function (err, decoded) {
            if (err) console.log(err);
            console.log(decoded);
            res.status(200).json(decoded);
        });
    },
    testEnshureToken: async function(req,res) {
        console.log(`Users email!!!!!!!!!!!!!!!${req.user.email}`);
        res.status(200).json({message: "personal area", data: req.user});
    },




};