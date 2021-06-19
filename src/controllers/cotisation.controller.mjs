import db from '../../db/models/index.js'
const Cotisation = db.cotisation
const Association = db.association
import {getUsersTokens, sendPushNotification} from '../utilities/pushNotification.mjs'


const addCotisation = async (req, res, next) => {
    const currentMontant = Number(req.body.montant)
    const data = {
        montant: currentMontant,
        motif: req.body.motif,
        typeCotisation: req.body.typeCotisation,
        dateDebut: req.body.dateDebut?req.body.dateDebut: new Date(),
        dateFin: req.body.dateFin?req.body.dateFin: new Date()
    }
    try {
        let selectedAssociation = await Association.findByPk(req.body.associationId)
        if(!selectedAssociation) return res.status(404).send("Association non trouvée")
        const newcotisation = await selectedAssociation.createCotisation(data)
        const tokens = await getUsersTokens(selectedAssociation)
        sendPushNotification("Nouvelle cotisation ajoutée dans votre association", tokens, "Nouvelle cotisation", {notifType: 'cotisation', associationId: selectedAssociation.id})
        return res.status(200).send(newcotisation)
    } catch (e) {
        next(e.message)
    }
}

const getAssociationCotisations = async (req, res, next) => {
    try {
      const allCotisations = await Cotisation.findAll({
          where: {
              associationId: req.body.associationId
          }
      })
        return res.status(200).send(allCotisations)
    } catch (e) {
        next(e)
    }
}

export {
    addCotisation,
    getAssociationCotisations
}