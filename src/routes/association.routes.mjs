import express from "express"
import {createAssociation, getAllAssociations, sendMessageToAssociation} from '../controllers/association.controller.mjs'
const router = express.Router()

router.post('/',createAssociation)
router.get('/',getAllAssociations)
router.patch('/sendMessage',sendMessageToAssociation)
export default router