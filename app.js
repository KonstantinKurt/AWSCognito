const express = require('express');
const session = require('express-session');
const app = express();
require('dotenv').config();
global.fetch = require(`node-fetch`);
const bodyParser = require('body-parser');
const cors = require('cors');
const usersRouter = require('./routes/usersRouter.js');
const mastercardRouter = require('./routes/mastercardRouter.js');
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', usersRouter);
app.use('/', mastercardRouter);

app.listen(process.env.PORT, () => {
    console.log(`Server runs on http://localhost:${process.env.PORT}; Ctrl+C for exit `);
});


