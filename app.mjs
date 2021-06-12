import dotenv from 'dotenv'
dotenv.config()
import logger from "./src/utilities/logger.mjs";
import bodyParser from 'body-parser'
import cors from 'cors'
import express from 'express'
import prod from './src/startup/prod.mjs'

const app = express();

logger.log()

if(!process.env.JWT_SECRET) {
    throw new Error('FATAL ERROR, la clef privée jwt nexiste pas')
    process.exit(1)
}


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
    logger.log('the app has been successfully connected to the database');
}).catch(error => {
    logger.log(error.message)});
import {routes} from './src/startup/routes.mjs'
routes(app)
import {errorHandler} from './src/middlewares/error.handler.mjs'
app.use(errorHandler)
prod(app)

export {app}
