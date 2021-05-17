import express from 'express'
const router = express.Router()
import {getUserAssociations, addNewMember, updateMemberState,
    updateMemberData, getAllMembers, getMemberInfos,readInfo, sendMessageToAssociation } from '../controllers/member.controller.mjs'

router.get('/', getAllMembers)
router.get('/associations',getUserAssociations)
router.post('/',addNewMember)
router.patch('/update', updateMemberState)
router.patch('/updateOne', updateMemberData)
router.post('/informations', getMemberInfos)
router.patch('/readInfos',readInfo)
router.patch('/sendAdhesionMessage', sendMessageToAssociation)

export default router