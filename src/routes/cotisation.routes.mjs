import express from 'express'
const router = express.Router()
import {verifyToken, isAdminOrModerator} from '../middlewares/authJWT.mjs'
import {addCotisation, getAssociationCotisations, deleteCotisation} from '../controllers/cotisation.controller.mjs'

router.post('/',[verifyToken, isAdminOrModerator], addCotisation)
router.post('/byAssociation',verifyToken, getAssociationCotisations)
router.delete('/deleteOne', [verifyToken, isAdminOrModerator], deleteCotisation)

export default router