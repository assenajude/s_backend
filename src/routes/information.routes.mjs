import express from 'express'
const  router = express.Router()
import {addInfo, getAllAssociationInfos} from '../controllers/information.controller.mjs'

router.post('/', addInfo)
router.post('/getAll', getAllAssociationInfos)

export default router