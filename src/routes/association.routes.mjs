import express from "express"
import {createAssociation, getAllAssociations,getAssociationMembers} from '../controllers/association.controller.mjs'
const router = express.Router()

router.post('/',createAssociation)
router.get('/',getAllAssociations)
router.post('/members', getAssociationMembers)


export default router