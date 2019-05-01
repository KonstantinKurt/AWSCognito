const request = require('request');
const keyGen = require('../libs/keygen.js');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
module.exports = {
    check3DS: async function (req, res) {
        const secureId = keyGen(10); //your unique identifier for this authentication;
        const merchantID = req.body.merchant.merchantID;
        const merchantPassword = req.body.merchant.password;
        const encodedCredentials = Buffer.from(`merchant.${merchantID}:${merchantPassword}`).toString('base64');
        const amount = req.body.amount;
        const responseUrl  = req.body.responseUrl;
        let requestObj = {
            "apiOperation": "CHECK_3DS_ENROLLMENT",
            "order": {
                "amount": amount,
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
                    "responseUrl": responseUrl,
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
            .then(checkRequestResult => {
                const data = JSON.parse(checkRequestResult);
                const veResEnrolledResult = data[`3DSecure`].veResEnrolled;

                const htmlBodyContent = data[`3DSecure`].authenticationRedirect.simple.htmlBodyContent;
                const dom = new JSDOM(htmlBodyContent);
                //console.log(veResEnrolledResult);
                if(veResEnrolledResult == `Y`){
                   res.status(202).json({message: "Succesful check 3DS enrollment",
                       pares: dom.window.document.getElementsByName('PaReq')[0].value,
                       echoForm: dom.window.document.getElementsByName('echoForm')[0].action,
                       termUrl: dom.window.document.getElementsByName('TermUrl')[0].value,
                       md: dom.window.document.getElementsByName('MD')[0].value,
                       "3DSecureId": data[`3DSecureId`],
                        data: htmlBodyContent});
                }
                else{
                    res.status(202).json({message: "Failed check 3DS enrollment", data: data});
                }
            })
            .catch(err => {
                res.status(403).json('invalid requestObj');
                console.log(err);
            });
    },
    payment3ds: async function (req, res) {
        const merchantID = req.body.merchant.merchantID;
        const merchantPassword = req.body.merchant.password;
        const encodedCredentials = Buffer.from(`merchant.${merchantID}:${merchantPassword}`).toString('base64');
        const secureId = req.body.secureId;
        const pares = req.body.PaRes;
        let requestObj = {
            "apiOperation": "PROCESS_ACS_RESULT",
            "3DSecure": {
                "paRes": pares
            }
        };
        requestObj = JSON.stringify(requestObj);
        const requestURL = `https://test-gateway.mastercard.com/api/rest/version/51/merchant/${merchantID}/3DSecureId/${secureId}`;
        const headers = {
            'Authorization': `Basic ${encodedCredentials}`,
            'Content-Type': 'application/json'
        };
        //res.status(200).json(requestURL);
        let processACS = new Promise((resolve, reject) => {
            request.post({url: requestURL, form: requestObj, headers: headers},
                (error, res, body) => {
                    if (error) {
                        console.log(error);
                        reject(error);
                        return
                    }
                    resolve(body);
                })
        });
        processACS
            .then(checkRequestResult => {
                const data = JSON.parse(checkRequestResult);
                if(!data.error) {
                    let requestObj =  {
                        "apiOperation": "PAY",
                        "order":
                            {
                                "reference": " ",
                                "currency": process.env.CURRENCY_LABEL,
                                "amount": req.body.amount,
                            },
                        "transaction":
                            {
                                "reference": " "
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
                                                "securityCode": req.body.code, // card cvv code;
                                                "number": req.body.number // card number;
                                            }
                                    },
                                "type": "CARD"
                            }
                    };
                    requestObj = JSON.stringify(requestObj);
                    const orderID = "order-" + keyGen(10);
                    const transactionID = "trans-" + keyGen(10);
                    const merchantID = req.body.merchant.merchantID;
                    const merchantPassword = req.body.merchant.password;
                    const encodedCredentials = Buffer.from(`merchant.${merchantID}:${merchantPassword}`).toString('base64');
                    const requestURL = `https://test-gateway.mastercard.com/api/rest/version/51/merchant/${merchantID}/order/${orderID}/transaction/${transactionID}`;
                    const headers = {
                        'Authorization': `Basic ${encodedCredentials}`,
                        'Content-Type': 'application/json'
                    };
                    let payRequest = new Promise((resolve, reject) => {
                        request.put({url: requestURL, form: requestObj, headers: headers},
                            (error, res, body) => {
                                if (error) {
                                    reject(error);
                                    return
                                }
                                resolve(body);
                            })
                    });
                    payRequest
                        .then(payRequestres => {
                            const data = JSON.parse(payRequestres);
                            if(data.result === `SUCCESS`){
                                data.message = 'Successfully payload';
                                data.transactionId = transactionID;
                                data.orderID = orderID;
                                res.status(202).json(data);
                            }
                            else{
                                data.message = 'Payload rejected';
                                res.status(400).json(data);
                            }
                        })
                        .catch(err => res.status(403).json('invalid data'));

                }
                else{
                    res.status(400).json({data});
                }
            })
            .catch(err => {
                res.status(403).json('invalid requestObj');
                console.log(err);
            });
        },
    refund:  function (req, res) {
        const orderID = req.body.orderID;
        const transactionID = req.body.transactionId;
        const merchantID = req.body.merchant.merchantID;
        const merchantPassword = req.body.merchant.password;
        const encodedCredentials = Buffer.from(`merchant.${merchantID}:${merchantPassword}`).toString('base64');
        let requestObj =  {
            "apiOperation": "REFUND",
            "transaction": {
                "amount": req.body.amount,
                "currency": process.env.CURRENCY_LABEL
            }
        };
        requestObj = JSON.stringify(requestObj);
        const requestURL = `https://test-gateway.mastercard.com/api/rest/version/51/merchant/${merchantID}/order/${orderID}/transaction/${transactionID}`;
        const headers = {
            'Authorization': `Basic ${encodedCredentials}`,
            'Content-Type': 'application/json'
        };
        let refundRequest = new Promise((resolve, reject) => {
            request.put({url: requestURL, form: requestObj, headers: headers},
                (error, res, body) => {
                    if (error) {
                        reject(error);
                        return
                    }

                    resolve(body);
                })
        });
        refundRequest
            .then(refundRequestres => {
                const data = JSON.parse(refundRequestres);
                if(data.result === `SUCCESS`){
                    data.message = 'Successfully refund';
                    data.transactionId = transactionID;
                    data.orderID = orderID;
                    res.status(202).json(data);
                }
                else {
                    data.message = 'Refund rejected';
                    res.status(400).json(data);
                }
            })
            .catch(err => res.status(403).json({'invalid data': err}));
    },
    test:  function (req, res) {

    },

};