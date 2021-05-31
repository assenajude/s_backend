import express from 'express'
const router = express.Router()
import {getUserAssociations, addNewMember,respondToAdhesionMessage,
    updateMemberData, getAllMembers, getMemberInfos,readInfo, sendMessageToAssociation, editImages } from '../controllers/member.controller.mjs'

router.get('/', getAllMembers)
router.get('/associations',getUserAssociations)
router.post('/',addNewMember)
router.patch('/respondToAdhesionMessage', respondToAdhesionMessage)
router.patch('/updateOne', updateMemberData)
router.post('/informations', getMemberInfos)
router.patch('/readInfos',readInfo)
router.patch('/sendAdhesionMessage', sendMessageToAssociation)
router.patch('/editImages', editImages)

export default router