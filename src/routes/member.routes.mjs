import express from 'express'
const router = express.Router()
import {checkDuplicateUsernameOrEmail} from '../middlewares/verifySignUp.mjs'
import {getMemberAssociations, addNewMember, updateMemberState, getAssociationMembers} from '../controllers/member.controller.mjs'

router.get('/associations',getMemberAssociations)
router.post('/',addNewMember)
router.patch('/update', updateMemberState)
router.post('/all', getAssociationMembers)


export default router