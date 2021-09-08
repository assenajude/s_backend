import express from "express"
import {verifyToken, isAdmin, isAdminOrModerator} from '../middlewares/authJWT.mjs'
import {createAssociation, getAllAssociations,editMemberRoles,
    getconnectedMemberRoles, updateAvatar, getSelectedAssociation, updateReglement, deleteOne} from '../controllers/association.controller.mjs'
const router = express.Router()

router.post('/', verifyToken,createAssociation)
router.get('/',getAllAssociations)
router.patch('/editRoles',[verifyToken, isAdmin], editMemberRoles)
router.post('/members/roles',verifyToken, getconnectedMemberRoles)
router.patch('/updateAvatar',[verifyToken, isAdminOrModerator], updateAvatar)
router.post('/selectedAssociation',verifyToken, getSelectedAssociation)
router.post('/updateReglement',[verifyToken, isAdmin], updateReglement)
router.delete('/deleteOne',[verifyToken, isAdmin], deleteOne)

export default router