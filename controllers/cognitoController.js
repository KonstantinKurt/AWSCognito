const amazonCognitoIdentity = require('amazon-cognito-identity-js');

const poolData = {
    UserPoolId: process.env.USER_POOL_ID,
    ClientId: process.env.CLIENT_ID
};
 const userPool = new amazonCognitoIdentity.CognitoUserPool(poolData);

module.exports = {
    signUp: async function(req, res) {
        const password = req.body.password;
        const emailData = {
         Name: `email` ,
         Value:req.body.email
       };
       const emailAttribute = new amazonCognitoIdentity.CognitoUserAttribute(emailData);
       userPool.signUp(req.body.email,password,[emailAttribute],null,(err,data)=>{
           if(err) return console.log(err);
           res.status(201).json({message: `user saved`, data: data.user});
       });
    },
    signIn: async function(req, res) {
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
               res.status(202).json({message:`authefication succesful`, data: data});
            },
            onFailure: err =>{
                console.log(err);
            }
        })
    },

};