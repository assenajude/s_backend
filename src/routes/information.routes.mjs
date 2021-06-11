import express from 'express'
import {verifyToken, isAdminOrModerator} from '../middlewares/authJWT.mjs'
const  router = express.Router()
import {addInfo, getAllAssociationInfos} from '../controllers/information.controller.mjs'

router.post('/',[verifyToken, isAdminOrModerator], addInfo)
router.post('/getAll',verifyToken, getAllAssociationInfos)

export default router