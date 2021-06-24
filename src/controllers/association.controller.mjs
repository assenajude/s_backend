import cryptoRandomString from "crypto-random-string";
import db from '../../db/models/index.js'
import {sendPushNotification, getUsersTokens} from "../utilities/pushNotification.mjs";
const Op = db.Sequelize.Op
const Association = db.association
const Information = db.information
const Member = db.member
const Role = db.role


const createAssociation = async (req, res, next) => {

    const data = {
        nom: req.body.nom,
        avatar: req.body.avatar?req.body.avatar: '',
        description: req.body.description,
        cotisationMensuelle: req.body.cotisationMensuelle,
        frequenceCotisation: req.body.frequenceCotisation,
        fondInitial: req.body.fondInitial,
        seuilSecurite: req.body.seuilSecurite,
        statut:req.body.statut?req.body.statut:'standard',
        interetCredit: req.body.interetCredit,
        validationLenght: req.body.validatorsNumber>0?req.body.validatorsNumber: 0
    }
    try {
        let selectedAssociation;
        if(req.body.id && req.body.id !== null && req.body.id !== "") {
             selectedAssociation = await Association.findByPk(req.body.id)
            if(!selectedAssociation)return res.status(404).send("association non trouvée")
            await selectedAssociation.update({
                nom: req.body.nom,
                avatar: req.body.avatar?req.body.avatar: '',
                description: req.body.description,
                cotisationMensuelle: req.body.cotisationMensuelle,
                frequenceCotisation: req.body.frequenceCotisation,
                fondInitial: req.body.fondInitial,
                seuilSecurite: req.body.seuilSecurite,
                statut:req.body.statut?req.body.statut:'standard',
                interetCredit: req.body.interetCredit,
                validationLenght: req.body.validatorsNumber>0?req.body.validatorsNumber: 0
            })
        } else {
        selectedAssociation = await Association.create(data)
            const newCode = cryptoRandomString({length: 5, type: 'alphanumeric'});
        selectedAssociation.code = newCode
        await selectedAssociation.save()
        }
        return res.status(201).send(selectedAssociation)
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

const getSelectedAssociation = async (req, res, next) => {
    try {
        const selectedAssociation = await Association.findByPk(req.body.associationId)
        if(!selectedAssociation)return res.status(404).send({message: "Association non trouvée."})
        return res.status(200).send(selectedAssociation)
    } catch (e) {
        next(e.message)
    }
}


const editMemberRoles = async (req, res, next) => {
    try {
        let selectedMember = await Member.findByPk(req.body.memberId)
        const roles = req.body.roles
        if(roles) {
            const memberRoles = await Role.findAll({
                where: {
                    name: {
                        [Op.or]: roles
                    }
                }
            })
            await selectedMember.setRoles(memberRoles)
        } else {
            await selectedMember.setRoles([1])
        }

        return res.status(200).send({message: "Role édité avec succès."})
    } catch (e) {
        next(e.message)
    }
}

const getconnectedMemberRoles = async (req, res, next) => {
    try {
        const connectedMember = await Member.findByPk(req.body.memberId)
        if(!connectedMember) return res.status(404).send("membre non trouvé")
        const memberRoles = await connectedMember.getRoles()
        const authorities = []
        memberRoles.forEach(role => {
            authorities.push('ROLE_'+role.name.toUpperCase())
        })
        return res.status(200).send(authorities)
    } catch (e) {
        next(e.message)
    }
}

const updateAvatar = async (req, res, next) => {
    try {
        let selectedAssociation = await Association.findByPk(req.body.associationId)
        if(!selectedAssociation)return res.status(404).send("Association non trouvée")
        selectedAssociation.avatar = req.body.avatarUrl
        await selectedAssociation.save()
        const justUpdated = await Association.findByPk(selectedAssociation.id,{
            include: Information
        })
        return res.status(200).send(justUpdated)
    } catch (e) {
        next(e.message)
    }
}

const updateReglement = async (req, res, next) => {
    try {
        let selectedAssociation = await Association.findByPk(req.body.associationId)
        if(!selectedAssociation)return res.status(404).send("Association non trouvée.")
        selectedAssociation.reglementInterieur = req.body.reglementUrl
        await selectedAssociation.save()
        const tokens = await getUsersTokens(selectedAssociation)
        sendPushNotification("Reglement interieur mis à jour.", tokens, "Mis à jour reglement.", {notifType:'reglement', associationId: selectedAssociation.id})
        return res.status(200).send(selectedAssociation)
    } catch (e) {
        next(e)
    }
}

export {
    createAssociation,
    getAllAssociations,
    editMemberRoles,
    getconnectedMemberRoles,
    updateAvatar,
    getSelectedAssociation,
    updateReglement
}