const request = require('request');
const keyGen = require('../libs/keygen.js');

module.exports = function check3DS(req, res, next) {
    const secureId = keyGen(10);
    const merchantID = req.body.merchant.merchantID;
    const merchantPassword = req.body.merchant.password;
    const encodedCredentials = Buffer.from(`merchant.${merchantID}:${merchantPassword}`).toString('base64');
    let requestObj = {
        "apiOperation": "CHECK_3DS_ENROLLMENT",
        "order": {
            "amount": "1000",
            "currency": process.env.CURRENCY_LABEL
        },
        "sourceOfFunds":
            {
                "provided":
                    {
                        "card":
                            {
                                "expiry":
                                    {
                                        "month": req.body.month, // card expiry;
                                        "year": req.body.year
                                    },
                                "number": req.body.number // card number;
                            }
                    },
            },
        "3DSecure": {
            "authenticationRedirect": {
                "responseUrl": "http://www.google.ua",
                "pageGenerationMode": "SIMPLE"
            }
        }
    };
    requestObj = JSON.stringify(requestObj);
    const requestURL = `https://test-gateway.mastercard.com/api/rest/version/51/merchant/${merchantID}/3DSecureId/${secureId}`;
    const headers = {
        'Authorization': `Basic ${encodedCredentials}`,
        'Content-Type': 'application/json'
    };
    let checkRequest = new Promise((resolve, reject) => {
        request.put({url: requestURL, form: requestObj, headers: headers},
            (error, res, body) => {
                if (error) {
                    reject(error);
                    return
                }
                resolve(body);
            })
    });
    checkRequest
        .then(checkResult => {
            const data = JSON.parse(checkResult);
            const secureId = data[`3DSecureId`];
            console.log(`First middleware /////////  ${secureId}`);
            secureId ? next() : res.status().json({"message": "There was a problem with 3DS Authentification", data: data});

        })
        .catch(err => {
            res.status(403).json('invalid requestObj');
            console.log(err);
        });
};




