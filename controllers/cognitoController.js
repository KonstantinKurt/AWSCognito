const amazonCognitoIdentity = require('amazon-cognito-identity-js');
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const request = require('request');
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
        //const jwkUrl = `https://cognito-idp.${process.env.POOL_REGION}.amazonaws.com/${process.env.USER_POOL_ID}/.well-known/jwks.json`;
        //https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_Tzavey1zu/.well-known/jwks.json
        const jwk = {
            "keys": [
                {
                    "alg": "RS256",
                    "e": "AQAB",
                    "kid": "Vn/VUhKUkpi80Z1oFyRSqEsj4Gp3tAoicYgf6qtPu4k=",
                    "kty": "RSA",
                    "n": "rDRWELU5Z9d0H9Qos4vVSf0gpUqCL9xnYyOvjIGG13VHFILufzIre4N9enZLuj86cmg2jvb-6ZNsx_HJ7R8deYLwi6Ymr6LvWjgjT5diQhG2dHTD5dRRcOrAM3veCaN7KWQkRm3Ntc2tvLVUzv41ST_5ksYnnFQj-5g0gCwSn1exdcYHpaSazhWFikr2TsxvHx7exRjxhWd-lsuc0IctNA2LuEPrt8MmMZXw12aXLQFsXgr-ekUHiDFJTduWqv8Nh3Rk8u9FJvcaXY6SzFcEq1N5zgJdcuw8SC7_HDZL97Zg--WPUm8XwHL7skVK_go4nbegM57XAD2_y7v5-LH9TQ",
                    "use": "sig"
                }
                ,
                {
                    "alg": "RS256",
                    "e": "AQAB",
                    "kid": "p7zJIF6qPQCCZsFPuwBtbWPFlubJ8/b/w01aAE1bzAM=",
                    "kty": "RSA",
                    "n": "pXD6l_IFY5Krkhq2MiD--fnCqH67JgrQGd-aNoWctuUUi-TPp9UsCgIXvlP___-gX5wZf-WJ5GtIAePsg8zTbD9QOB1mvHARYDa1OwCRuc21dyTPvBzxU-AUYZQFVM1XqLMuLiwkiDSQcT7vZhajsf_uyQRvJBNyCbo6Ft37GiQ6B5yjKKCqlqS86F2deMGxTF7NrBcFD3im6SgwPhdrYJKct-Kaj0Gq7bq7HQPl441R52LaVU8zWZwLSTxhwFVh09hXcM_aXzHmvt_U5xjKIHJ_BaJEmsVRaOzUaEZ_HeMYD_rZdTEWMOqHeg0kmqijfxegLsj2xp5nvltgFg1Znw",
                    "use": "sig"
                }]
        };
        const pem = jwkToPem(jwk);
        console.log(pem);
        // jwt.verify(token, pem, function (err, decoded) {
        //     if(err) console.log(err);
        //     console.log(decoded);
        //     res.status(200).json(decoded);
        // });
    },
    // decodeToken1: function ValidateToken(token) {
    //     request({
    //             url: `https://cognito-idp.${process.env.POOL_REGION}.amazonaws.com/${process.env.USER_POOL_ID}/.well-known/jwks.json`,
    //             json: true
    //         },
    //         function (error, response, body) {
    //             if (!error && response.statusCode === 200) {
    //                 pems = {};
    //                 var keys = body['keys'];
    //                 for (var i = 0; i < keys.length; i++) {
    //                     //Convert each key to PEM
    //                     var key_id = keys[i].kid;
    //                     var modulus = keys[i].n;
    //                     var exponent = keys[i].e;
    //                     var key_type = keys[i].kty;
    //                     var jwk = {kty: key_type, n: modulus, e: exponent};
    //                     var pem = jwkToPem(jwk);
    //                     pems[key_id] = pem;
    //                 }
    //                 //validate the token
    //                 var decodedJwt = jwt.decode(token, {complete: true});
    //                 if (!decodedJwt) {
    //                     console.log("Not a valid JWT token");
    //                     return;
    //                 }
    //
    //                 var kid = decodedJwt.header.kid;
    //                 var pem = pems[kid];
    //                 if (!pem) {
    //                     console.log('Invalid token');
    //                     return;
    //                 }
    //
    //                 jwt.verify(token, pem, function (err, payload) {
    //                     if (err) {
    //                         console.log("Invalid Token.");
    //                     } else {
    //                         console.log("Valid Token.");
    //                         console.log(payload);
    //                     }
    //                 });
    //             } else {
    //                 console.log("Error! Unable to download JWKs");
    //             }
    //         });
    // },


};