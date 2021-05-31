import express from 'express'
const router = express.Router()
import {getUploadSignature} from '../controllers/uploadImage.controller.mjs'

router.post('/s3_upload', getUploadSignature)

export default router