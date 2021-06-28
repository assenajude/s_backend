import db from '../../db/models/index.js'
import decoder from 'jwt-decode'
const Cotisation = db.cotisation
const Association = db.association
const Historique = db.historique
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
        let selectedCotisation;
        let selectedAssociation = await Association.findByPk(req.body.associationId)
        if(!selectedAssociation) return res.status(404).send("Association non trouvée")
        if(req.body.id && req.body.id > 0) {
             selectedCotisation = await Cotisation.findByPk(req.body.id)
            if(!selectedCotisation) return res.status(404).send({message: "Cotisation introuvable"})
            await selectedCotisation.update(data)
        } else {
            selectedCotisation = await selectedAssociation.createCotisation(data)
        }
        const tokens = await getUsersTokens(selectedAssociation)
        sendPushNotification(`Il y'a une nouvelle cotisation dans ${selectedAssociation.nom}`, tokens, "Nouvelle cotisation", {notifType: 'cotisation', associationId: selectedAssociation.id})
        return res.status(200).send(selectedCotisation)
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

const deleteCotisation = async (req, res, next) => {
    const token = req.headers['x-access-token']
    const connectedUser = decoder(token)
    try{
        let selectedCotisation = await Cotisation.findByPk(req.body.cotisationId, {
            include: Association
        })
        const membersCotisations = await selectedCotisation.getMembers()
        if(membersCotisations.length === 0) {
            await selectedCotisation.destroy()
        } else {
            const data = {
                cotisation: selectedCotisation,
                deleter: connectedUser
            }
            await Historique.create({
                histoType: 'cotisation',
                description: "deleting cotisation",
                histoData: [data]
            })
            await selectedCotisation.destroy()
        }
        return res.status(200).send({cotisationId: selectedCotisation.id})

    } catch (e) {
        next(e)
    }
}

export {
    addCotisation,
    getAssociationCotisations,
    deleteCotisation
}