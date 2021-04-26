import dotenv from 'dotenv'
dotenv.config()
import {createRequire} from 'module'
// const require = createRequire()

import bodyParser from 'body-parser'
import cors from 'cors'
import express from 'express'

const app = express();


const corsOption = {
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE"
}

app.use(cors(corsOption));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use((req, res, next)=> {
    res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
    );
    next();
});

import db from './db/models/index.js'
db.sequelize.sync().then(() => {
    console.log('the app has been successfully connected to the database');
}).catch(error => {
    console.error(error.message)});
import {routes} from './src/startup/routes.mjs'
routes(app)
import {errorHandler} from './src/middlewares/error.handler.mjs'
app.use(errorHandler)

export {app}
