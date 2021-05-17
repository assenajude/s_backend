import cryptoRandomString from "crypto-random-string";
import db from '../../db/models/index.js'
const Association = db.association
const User = db.user
const Member = db.member
const Information = db.information


const createAssociation = async (req, res, next) => {
    const data = {
        nom: req.body.nom,
        description: req.body.description,
        cotisationMensuelle: req.body.cotisationMensuelle,
        frequenceCotisation: req.body.frequenceCotisation,
        fonds: req.body.fonds,
        statut:req.body.statut?req.body.statut:'standard',
        interetCredit: req.body.interetCredit
    }
    try {
        let newAssociation = await Association.create(data)
        const newCode = cryptoRandomString({length: 5, type: 'alphanumeric'});
        newAssociation.code = newCode
        await newAssociation.save()
        return res.status(201).send(newAssociation)
    } catch (e) {
        next(e)
    }
}

const getAllAssociations = async (req, res, next) => {
    try {
        const associations = await Association.findAll({
            include: [Information]
        })
        return res.status(200).send(associations)
    } catch (e) {
        next(e)
    }
}




const getAssociationMembers = async (req, res, next) => {
    try {
        const selectedAssociation = await Association.findByPk(req.body.associationId)
        const members =await selectedAssociation.getUsers({
            attributes: {exclude:['password']}
        })
        return res.status(200).send(members)
    } catch (e) {
        next(e.message)
    }
}


export {
    createAssociation,
    getAllAssociations,
    getAssociationMembers
}