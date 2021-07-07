import express from 'express'
const router = express.Router()
import {signup,signin, signinByPin, signupByPin} from '../controllers/auth.controller.mjs'
import {checkRolesExisted, checkDuplicateUsernameOrEmail, checkDuplicatePhoneNumber} from '../middlewares/verifySignUp.mjs'

router.post('/signup',[checkDuplicateUsernameOrEmail, checkRolesExisted],signup)
router.post('/signin',signin)
router.post('/signupByPin',checkDuplicatePhoneNumber, signupByPin)
router.post('/signinByPin',signinByPin)

export default router

