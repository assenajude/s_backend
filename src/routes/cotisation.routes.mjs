import express from 'express'
const router = express.Router()
import {verifyToken, isAdminOrModerator} from '../middlewares/authJWT.mjs'
import {addCotisation, getAssociationCotisations} from '../controllers/cotisation.controller.mjs'

router.post('/',[verifyToken, isAdminOrModerator], addCotisation)
router.post('/byAssociation',verifyToken, getAssociationCotisations)

export default router