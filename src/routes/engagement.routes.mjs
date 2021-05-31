import express from 'express'
const router = express.Router()
import {addEngagement, getEngagementsByAssociation, validEngagement, updateEngagement, voteEngagement,
    getEngagementVotes, payTranche} from '../controllers/engagement.controller.mjs'

router.post('/', addEngagement)
router.post('/byAssociation', getEngagementsByAssociation)
router.patch('/validation', validEngagement)
router.patch('/update', updateEngagement)
router.patch('/vote', voteEngagement)
router.post('/allVotes', getEngagementVotes)
router.patch('/payTranche', payTranche)



export default router