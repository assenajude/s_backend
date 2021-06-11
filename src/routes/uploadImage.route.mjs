import express from 'express'
const router = express.Router()
import {getUploadSignature} from '../controllers/uploadImage.controller.mjs'
import {verifyToken} from "../middlewares/authJWT.mjs";

router.post('/s3_upload', verifyToken, getUploadSignature)

export default router