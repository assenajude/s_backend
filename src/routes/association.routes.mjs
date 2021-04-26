import express from "express"
import {createAssociation, getAllAssociations, sendAdhesionMessage} from '../controllers/association.controller.mjs'
const router = express.Router()

router.post('/',createAssociation)
router.get('/',getAllAssociations)
router.patch('/adhesionMessage',sendAdhesionMessage)

export default router