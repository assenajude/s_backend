import express from 'express'
const router = express.Router()
import {addCotisation, getAssociationCotisations} from '../controllers/cotisation.controller.mjs'

router.post('/', addCotisation)
router.post('/all', getAssociationCotisations)

export default router