import express from "express"
import {createAssociation, getAllAssociations,getAssociationMembers, editMemberRoles,
    getconnectedMemberRoles, updateAvatar} from '../controllers/association.controller.mjs'
const router = express.Router()

router.post('/',createAssociation)
router.get('/',getAllAssociations)
router.post('/members', getAssociationMembers)
router.patch('/editRoles', editMemberRoles)
router.post('/members/roles', getconnectedMemberRoles)
router.patch('/updateAvatar', updateAvatar)

export default router