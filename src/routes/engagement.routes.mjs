import express from 'express'
import {verifyToken, isAdminOrModerator} from '../middlewares/authJWT.mjs'
const router = express.Router()
import {addEngagement, getEngagementsByAssociation, validEngagement, updateEngagement, voteEngagement,
    getEngagementVotes, payTranche, getSelectedEngagement} from '../controllers/engagement.controller.mjs'

router.post('/',verifyToken, addEngagement)
router.post('/byAssociation', verifyToken, getEngagementsByAssociation)
router.patch('/validation',[verifyToken, isAdminOrModerator], validEngagement)
router.patch('/update',verifyToken, updateEngagement)
router.patch('/vote',verifyToken, voteEngagement)
router.post('/allVotes',verifyToken, getEngagementVotes)
router.patch('/payTranche',verifyToken, payTranche)
router.post('/getById',verifyToken, getSelectedEngagement)



export default router