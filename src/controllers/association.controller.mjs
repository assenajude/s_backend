import cryptoRandomString from "crypto-random-string";
import decoder from 'jwt-decode'
import db from '../../db/models/index.js'
import {sendPushNotification, getUsersTokens} from "../utilities/pushNotification.mjs";
const Op = db.Sequelize.Op
const Association = db.association
const Cotisation = db.cotisation
const Information = db.information
const Engagement = db.engagement
const Historique = db.historique
const Member = db.member
const User = db.user
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
        validationLenght: req.body.validatorsNumber>0?req.body.validatorsNumber: 0,
        penality: req.body.penality>0?req.body.penality: 0,
        individualQuotite: req.body.individualQuotite>0?req.body.individualQuotite: 0,
        isValid: req.body.validation
    }
    try {
        let selectedAssociation;
        if(req.body.id) {
             selectedAssociation = await Association.findByPk(req.body.id)
            if(!selectedAssociation)return res.status(404).send("association non trouvée")
            await selectedAssociation.update(data)
        } else {
        selectedAssociation = await Association.create(data)
            const newCode = cryptoRandomString({length: 5, type: 'alphanumeric'});
        selectedAssociation.code = newCode
        await selectedAssociation.save()
            const creatorUser = await User.findByPk(req.body.creatorId)
            if(!creatorUser) return res.status(404).send("utilisateur non trouvé")
            await selectedAssociation.addUser(creatorUser, {
                through: {
                    relation: 'member',
                    statut: 'moderator',
                    adhesionDate: Date.now()
                }
            })
            let creatorMember = await Member.findOne({
                where: {
                    userId: creatorUser.id
                }
            })

            const memberRoles = await Role.findAll({
                where: {
                    name: 'moderator'
                }
            })
            await creatorMember.setRoles(memberRoles)
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
        if(tokens.length>0) {
            sendPushNotification("Reglement interieur mis à jour.", tokens, "Mis à jour reglement.", {notifType:'reglement', associationId: selectedAssociation.id})
        }
        return res.status(200).send(selectedAssociation)
    } catch (e) {
        next(e)
    }
}

const deleteOne = async (req, res, next) => {
    const token = req.headers['x-access-token']
    const user = decoder(token)
    try {
        let selectedAssociation = await Association.findByPk(req.body.associationId)
        if(!selectedAssociation) return res.status(404).send({message: "Association non trouvée."})
        if(selectedAssociation.fondInitial !== 0) {
            return res.status(401).send({message: "Vous n'êtes pas autorisé à supprimer cette association."})
        }
        const associationMembers = await Member.findAll({
            where: {
                associationId: selectedAssociation.id
            }
        })
        let engagementsInAssociation = []
        if(associationMembers.length > 0) {
        const membersIds = associationMembers.map(item => item.id)
         engagementsInAssociation = await Engagement.findAll({
            where: {
                creatorId: {
                    [Op.in]: [membersIds]
                }
            }
        })
        }
        const inPaying = engagementsInAssociation.some(engage => engage.statut.toLowerCase() === 'paying')
        if(inPaying) {
            return res.status(401).send({message: "Vous n'êtes pas autorisé à supprimer cette association."})
        }
        const isSomeFunds = associationMembers.some(member => member.fonds !== 0)
        if(isSomeFunds) {
            return res.status(401).send({message: "Vous n'êtes pas autorisé à supprimer cette association."})
        }
        const associationInfos = await Information.findAll({
            where: {
                associationId: selectedAssociation.id
            }
        })
        const associationCotisations = await Cotisation.findAll({
            where: {
                associationId: selectedAssociation.id
            }
        })

        const data = {
            deleter: user,
            association: selectedAssociation,
            members: associationMembers,
            cotisations: associationCotisations,
            engagements: engagementsInAssociation,
            infos: associationInfos
        }
        await Historique.create({
            histoType: "association",
            description: "deleting association",
            histoData: [data]
        })
        await selectedAssociation.destroy()
        return res.status(200).send({associationId: req.body.associationId})
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
    updateReglement,
    deleteOne
}