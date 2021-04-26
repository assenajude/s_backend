import express from 'express'
import {getMemberAssociations} from '../controllers/member.controller.mjs'
const router = express.Router()

router.get('/associations',getMemberAssociations)

export default router