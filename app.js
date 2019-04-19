const express = require('express');
const app = express();
require('dotenv').config();
global.fetch = require(`node-fetch`);
const bodyParser = require('body-parser');
const cors = require('cors');
const cognitoRouter = require('./routes/cognitoRouter.js');
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));




app.use('/', cognitoRouter);

app.listen(process.env.PORT, () => {
    console.log(`Server runs on http://localhost:'  ${process.env.PORT}  '; Ctrl+C for exit `);
});


//Cognito has an internal data store in which user data is persisted. This can be viewed and edited (as an admin) through the 'Users' tab of your user pool.