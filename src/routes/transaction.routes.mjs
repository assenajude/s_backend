import express from 'express'
import {verifyToken, isAdmin} from '../middlewares/authJWT.mjs'

const router = express.Router()
import {updateTransaction, addTransaction, getUserTransaction, cancelTransaction, deleteOneTransaction} from '../controllers/transaction.controller.mjs'

router.post('/',verifyToken, addTransaction)
router.post('/byUser',verifyToken, getUserTransaction)
router.patch('/update',[verifyToken, isAdmin], updateTransaction)
router.patch('/cancelOne',[verifyToken, isAdmin], cancelTransaction)
router.delete('/deleteOne',[verifyToken, isAdmin], deleteOneTransaction)

export default router