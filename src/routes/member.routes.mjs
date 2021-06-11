import express from 'express'
import {verifyToken, isAdminOrModerator, isModerator, isAdmin} from '../middlewares/authJWT.mjs'

const router = express.Router()
import {getUserAssociations, addNewMember,respondToAdhesionMessage,payCotisation,getMembersCotisations,
    updateMemberData, getAllMembers, getMemberInfos,readInfo, sendMessageToAssociation, editImages } from '../controllers/member.controller.mjs'

router.get('/',verifyToken, getAllMembers)
router.get('/associations',verifyToken, getUserAssociations)
router.post('/',[verifyToken, isAdminOrModerator], addNewMember)
router.patch('/respondToAdhesionMessage',[verifyToken, isAdminOrModerator],respondToAdhesionMessage)
router.patch('/updateOne',verifyToken, updateMemberData)
router.post('/informations',verifyToken, getMemberInfos)
router.patch('/readInfos',verifyToken, readInfo)
router.patch('/sendAdhesionMessage',verifyToken, sendMessageToAssociation)
router.patch('/editImages',verifyToken, editImages)
router.patch('/payCotisations',verifyToken, payCotisation)
router.post('/membersCotisations',verifyToken, getMembersCotisations)

export default router