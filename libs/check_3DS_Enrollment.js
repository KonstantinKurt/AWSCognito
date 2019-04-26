const request = require('request');
const keyGen = require('../libs/keygen.js');

module.exports = function check3DS(req, res, next) {
    const secureId = keyGen(10);
    const encodedCredentials = Buffer.from(`merchant.${process.env.MERCHANT_ID}:${process.env.PASSWORD}`).toString('base64');
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
                                        "month": '11', // card expiry;
                                        "year": '20'
                                    },
                                "number": '5123456789012346' // card number;
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
    const requestURL = `https://test-gateway.mastercard.com/api/rest/version/51/merchant/${process.env.MERCHANT_ID}/3DSecureId/${secureId}`;
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
        })
        .catch(err => {
            res.status(403).json('invalid requestObj');
            console.log(err);
        });
};




