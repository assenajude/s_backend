import cryptoRandomString from "crypto-random-string";
import db from '../../db/models/index.js'
const Association = db.association
const Member = db.member


const createAssociation = async (req, res, next) => {
    const data = {
        nom: req.body.nom,
        description: req.body.description,
        cotisation: req.body.cotisation,
        frequence: req.body.frequence,
        fonds: req.body.fonds
    }
    try {
        let newAssociation = await Association.create(data)
        const newCode = cryptoRandomString({length: 5, type: 'alphanumeric'});
        newAssociation.code = newCode
        newAssociation.status = 'standard'
        await newAssociation.save()
        return res.status(201).send(newAssociation)
    } catch (e) {
        next(e)
    }
}

const getAllAssociations = async (req, res, next) => {
    try {
        const associations = await Association.findAll({
            include: [{model: Member, attributes:{exclude:['password']}}]
        })
        return res.status(200).send(associations)
    } catch (e) {
        next(e)
    }
}

const sendMessageToAssociation = async (req, res, next) => {
    try {
        let selectedAssociation = await Association.findByPk(req.body.associationId)
        if(!selectedAssociation) return res.status(404).send('association non trouvée')
        const connectedMember = await Member.findByPk(req.body.memberId)
        if(!connectedMember) return res.status(404).send("membre non trouvée")

        await selectedAssociation.addMember(connectedMember, {
            through: {
                messageSent: true,
                motif: req.body.motif,
                relation: 'pending'
            }
        })
        const newAssociations = await Association.findAll({
            include: [{model: Member, attributes:{exclude:['password']}}]
        })
        return res.status(200).send(newAssociations)
    } catch (e) {
        next(e)
    }
}



export {
    createAssociation,
    getAllAssociations,
    sendMessageToAssociation,
}