import express from "express"
import {verifyToken, isAdmin, isAdminOrModerator} from '../middlewares/authJWT.mjs'
import {createAssociation, getAllAssociations,getAssociationMembers, editMemberRoles,
    getconnectedMemberRoles, updateAvatar, getSelectedAssociation, getConnectedMember, updateReglement} from '../controllers/association.controller.mjs'
const router = express.Router()

router.post('/', [verifyToken, isAdmin],createAssociation)
router.get('/',getAllAssociations)
router.post('/members',verifyToken, getAssociationMembers)
router.patch('/editRoles',[verifyToken, isAdmin], editMemberRoles)
router.post('/members/roles',verifyToken, getconnectedMemberRoles)
router.patch('/updateAvatar',[verifyToken, isAdminOrModerator], updateAvatar)
router.post('/selectedAssociation',verifyToken, getSelectedAssociation)
router.post('/connectedMember',verifyToken, getConnectedMember)
router.post('/updateReglement',[verifyToken, isAdmin], updateReglement)

export default router