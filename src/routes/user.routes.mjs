import express from 'express'
const router = express.Router()

import {editUserInfo, editFund, updateImages} from '../controllers/user.controller.mjs'

router.patch('/editInfo', editUserInfo)
router.patch('/editFund', editFund)
router.patch('/editImages',updateImages)

export default router