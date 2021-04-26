import express from 'express'
const router = express.Router()
import {signup,signin} from '../controllers/auth.controller.mjs'
import {checkRolesExisted, checkDuplicateUsernameOrEmail} from '../middlewares/verifySignUp.mjs'

router.post('/signup',[checkDuplicateUsernameOrEmail, checkRolesExisted],signup)
router.post('/signin',signin)

export default router

