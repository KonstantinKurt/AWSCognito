const request = require('request');
const keyGen = require('../libs/keygen.js');

module.exports = {
    payment: async function (req, res) {
        console.log(`Users email!!!!!!!!!!!!!!!${req.user.email}`);
        //const userID = req.body.userID;
        let requestObj = await {
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
        const encodedCredentials = Buffer.from(`merchant.${process.env.MERCHANT_ID}:${process.env.PASSWORD}`).toString('base64');
        const requestURL = `https://test-gateway.mastercard.com/api/rest/version/51/merchant/${process.env.MERCHANT_ID}/order/${orderID}/transaction/${transactionID}`;
        const headers = {
            'Authorization': `Basic ${encodedCredentials}`,
            'Content-Type': 'application/json'
        };
        let test = new Promise((resolve, reject) => {
            request.put({url: requestURL, form: requestObj, headers: headers},
                (error, res, body) => {
                    if (error) {
                        reject(error);
                        return
                    }
                    resolve(body);
                })
        });
        test
            .then(testres => {
                const data = JSON.parse(testres);
                data.message = 'Successfully payload';
                data.transactionId = transactionID;
                data.orderID = orderID;
                res.status(202).json(data);

            })
            .catch(err => res.status(403).json('invalid data'));

    },
    refund: async function (req, res) {
        // const userID = req.body.userID;
        const orderID = req.body.orderID;
        const transactionID = req.body.transactionId;
        const encodedCredentials = Buffer.from(`merchant.${process.env.MERCHANT_ID}:${process.env.PASSWORD}`).toString('base64');
        let requestObj = await {
            "apiOperation": "REFUND",
            "transaction": {
                "amount": req.body.amount,
                "currency": process.env.CURRENCY_LABEL
            }
        };
        requestObj = JSON.stringify(requestObj);
        const requestURL = `https://test-gateway.mastercard.com/api/rest/version/51/merchant/${process.env.MERCHANT_ID}/order/${orderID}/transaction/${transactionID}`;
        const headers = {
            'Authorization': `Basic ${encodedCredentials}`,
            'Content-Type': 'application/json'
        };
        let test = new Promise((resolve, reject) => {
            request.put({url: requestURL, form: requestObj, headers: headers},
                (error, res, body) => {
                    if (error) {
                        reject(error);
                        return
                    }

                    resolve(body);
                })
        });
        test
            .then(testres => {
                let data = JSON.parse(testres);
                //data.message = 'Successfully rejected';
                res.status(202).json(data)
            })
            .catch(err => res.status(403).json('invalid data', err));
    },


};