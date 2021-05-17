import express from 'express'
const router = express.Router()
import {addEngagement, getEngagementsByAssociation} from '../controllers/engagement.controller.mjs'

router.post('/', addEngagement)
router.post('/byAssociation', getEngagementsByAssociation)

export default router