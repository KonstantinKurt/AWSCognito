const request = require('request');
const jwkToPem = require('jwk-to-pem');
const jwt = require('jsonwebtoken');


module.exports = function validateToken(req, res, next) {
    if (!req.headers.signin) {
        return res.status(401).send({ error: 'TokenMissing' });
    }
    const token = req.headers.signin;
    request({
        url: `https://cognito-idp.${process.env.POOL_REGION}.amazonaws.com/${process.env.USER_POOL_ID}/.well-known/jwks.json`,
        json: true
    }, function (error, response, body) {

        if (!error && res.statusCode === 200) {
            pems = {};
            let keys = body['keys'];

            for (let i = 0; i < keys.length; i++) {
                //Convert each key to PEM
                let key_id = keys[i].kid;
                let modulus = keys[i].n;
                let exponent = keys[i].e;
                let key_type = keys[i].kty;
                let jwk = {kty: key_type, n: modulus, e: exponent};
                let pem = jwkToPem(jwk);
                pems[key_id] = pem;
            }
            //validate the token
            let decodedJwt = jwt.decode(token, {complete: true});
            if (!decodedJwt) {
                console.log("Not a valid JWT token");
                return res.status(401).json({message: "Token invalid"});
            }

            let kid = decodedJwt.header.kid;
            let pem = pems[kid];
            if (!pem) {
                console.log('Invalid token');
                return res.status(401).json({message: "Token invalid"});
            }

            jwt.verify(token, pem, function (err, payload) {
                if (err) {
                    console.log("Invalid Token.");
                    return res.status(401).json({message: "Token invalid"});
                } else {
                    console.log("Valid Token.");
                    console.log(payload);
                    next();
                    //return res.status(200).json({message: "Valid token", data: payload});
                }
            });
        } else {
            console.log("Error! Unable to download JWKs");
        }
    });
};