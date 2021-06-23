import db from '../../db/models/index.js'
import decoder from 'jwt-decode'
const Member = db.member
const User = db.user
const Association = db.association
const Cotisation = db.cotisation
const Member_Info = db.member_info
const Member_Cotisation = db.member_cotisation
import {sendPushNotification, getUsersTokens} from '../utilities/pushNotification.mjs'

const getSelectedAssociationMembers = async (req, res, next) => {
    try {
        const selectedAssociation = await Association.findByPk(req.body.associationId)
        if(!selectedAssociation) return res.status(404).send({message: "association non trouvée."})
        const members = await selectedAssociation.getUsers({
            attributes: {exclude: ['password']}
        })
        return res.status(200).send(members)
    } catch (e) {
        next(e.message)
    }
}


const addNewMember = async (req, res, next) => {
    try {
        let newMember = await Member.create({
            statut: req.body.statut,
            fonds: req.body.fonds,
            avatar: req.body.avatar,
            adhesionDate: req.body.adhesionDate?req.body.adhesionDate:new Date(),
            backImage: req.body.backImage,
            relation: 'member'
        })
        const idAssociation = req.body.associationId
        const selectedAssociation = await Association.findByPk(idAssociation)
        const selectedUser = await User.findByPk(req.body.userId)
        await newMember.setUser(selectedUser)
        await newMember.setAssociation(selectedAssociation)

        return res.status(200).send(newMember)
    } catch (e) {
        next(e)
    }
}

const respondToAdhesionMessage = async (req, res, next) => {
    try {
        let associatedMember = await Member.findOne({
            where: {
                associationId: req.body.associationId,
                userId: req.body.userId
            }
        })
        associatedMember.relation = req.body.adminResponse
        associatedMember.adhesionDate = Date.now()
        associatedMember.statut = req.body.statut?req.body.statut:'ORDINAIRE'
        await associatedMember.save()
        const selectedUser = await User.findByPk(req.body.userId)
        const selectedAssociation = await Association.findByPk(req.body.associationId)
        const tokenTab = [selectedUser.pushNotificationToken]
        const message = req.body.adminResponse === 'member'? `Votre demande d'adhesion à ${selectedAssociation.nom} a été acceptée`:`Votre demande d'adhesion à ${selectedAssociation.nom} a été refusée.`
        sendPushNotification(message, tokenTab, `Reponse d'adhésion à ${selectedAssociation.nom} `, {notifType: "adhesion",statut: 'response', associationId: req.body.associationId})
        return res.status(200).send(associatedMember)
    } catch (e) {
        next(e.message)
    }
}


const updateMemberData = async (req, res, next) => {
    try {
        let selected = await Member.findByPk(req.body.currentMemberId)
        if(!selected) return res.status(404).send('member not exist')
        if(req.body.statut) selected.statut = req.body.statut
        if(req.body.fonds) selected.fonds += req.body.fonds
        if(req.body.relation) selected.relation = req.body.relation
        if(req.body.avatar) selected.avatar = req.body.avatar
        if(req.body.adhesionDate) selected.adhesionDate = req.body.adhesionDate
        if(req.body.backImage) selected.backImage = req.body.backImage
        await selected.save()
        return res.status(200).send(selected)
    } catch (e) {
        next(e.message)
    }
}


const getConnectedMemberUser = async (req, res, next) => {
    const token = req.headers['x-access-token']
    const user = decoder(token)
    try {
        const selectedAssociation = await Association.findByPk(req.body.associationId)
        if(!selectedAssociation) return res.status(404).send({message: "association non trouvé."})
        const associationMembers = await selectedAssociation.getUsers({
            attributes: {exclude: ['password']}
        })
        const connectedMember = associationMembers.find(item => item.id === user.id)
        return res.status(200).send(connectedMember)
    } catch (e) {
        next(e)
    }
}

const getMemberInfos = async (req, res, next) => {
    try {
        const selectedMember = await Member.findByPk(req.body.memberId)
        const selectedInfos = await selectedMember.getInformation()
        return res.status(200).send(selectedInfos)
    } catch (e) {
        next(e.message)
    }
}

const readInfo = async (req, res, next) => {
    try {
        let selectedInfo = await Member_Info.findOne({
            where: {
                memberId: req.body.memberId,
                informationId: req.body.informationId
            }
        })
        selectedInfo.isRead = true
        await selectedInfo.save()
        const selectedMember = await Member.findByPk(req.body.memberId)
        const currentInfos = await selectedMember.getInformation()
        return res.status(200).send(currentInfos)
    } catch (e) {
        next(e.message)
    }
}

const sendMessageToAssociation = async (req, res, next) => {
    try {
        let selectedAssociation = await Association.findByPk(req.body.associationId)
        if(!selectedAssociation) return res.status(404).send('association non trouvée')
        const connectedUser = await User.findByPk(req.body.userId)
        if(!connectedUser) return res.status(404).send("utilisateur non trouvé")
        await selectedAssociation.addUser(connectedUser, {
            through: {
                relation:req.body.relation?req.body.relation : 'onDemand'
            }
        })
        const userAssociationState = await connectedUser.getAssociations()
        const membersNotifTokens = await getUsersTokens(selectedAssociation)
        const filteredTokens = membersNotifTokens.filter(token => token !== connectedUser.pushNotificationToken)
        const userName = connectedUser.username?connectedUser.username : connectedUser.nom
        sendPushNotification(`${userName} souhaiterais adhérer à ${selectedAssociation.nom}.`, filteredTokens, `Demande d'adhesion à ${selectedAssociation.nom}`, {notifType:'adhesion', statut: 'sending', associationId: selectedAssociation.id})
        return res.status(200).send(userAssociationState)
    } catch (e) {
        next(e)
    }
}

const editImages = async(req, res, next) => {
    try {
        let selectedMember = await Member.findByPk(req.body.memberId)
        if(!selectedMember) return res.status(200).send("membre non trouvé")
        selectedMember.avatar = req.body.avatarUrl
        selectedMember.backImage = req.body.backImageUrl
        await selectedMember.save()
        const justUpdated = await Member.findByPk(selectedMember.id)
        return res.status(200).send(justUpdated)
    } catch (e) {
        next(e.message)
    }
}

const payCotisation = async (req, res, next) => {
    const montantToPay = Number(req.body.montant)
        const transaction = await db.sequelize.transaction()
    try {
        let selectedMember = await Member.findByPk(req.body.memberId, {transaction})
        if(!selectedMember) return res.status(404).send("Membre non trouvée")
        let selectedUser = await User.findByPk(selectedMember.userId, {transaction})
        if(!selectedUser) return res.status(404).send("L'utilisateur n'existe pas")
        if(selectedUser.wallet<montantToPay) return res.status(403).send("Fonds insuffisant")
        let selectedCotisation = await Cotisation.findByPk(req.body.cotisationId, {transaction})
        if(!selectedCotisation) return res.status(404).send("cette cotisation nexiste pas")
        let selectedAssociation = await Association.findByPk(selectedCotisation.associationId, {transaction})
        if(!selectedAssociation) return res.status(404).send("association non trouvée")
        await selectedMember.addCotisation(selectedCotisation, {
            through: {
                montant: montantToPay,
                paymentDate: new Date()
            },
            transaction
        })
        let newPayed = await Member_Cotisation.findOne({
            where: {
                memberId: selectedMember.id,
                cotisationId: selectedCotisation.id
            },
            transaction
        })
        if(montantToPay >= selectedCotisation.montant) {
            newPayed.isPayed = true
        }
        if(selectedCotisation.typeCotisation.toLowerCase() === 'mensuel') {
            selectedMember.fonds += montantToPay
        }
        selectedAssociation.fondInitial += montantToPay
        selectedUser.wallet -= montantToPay

        await newPayed.save({transaction})
        await selectedMember.save({transaction})
        await selectedUser.save({transaction})
        await selectedAssociation.save({transaction})
        const memberCotisState = await selectedMember.getCotisations({transaction})
        const memberName = selectedUser.userName?selectedUser.userName: selectedUser.nom
        const tokens = await getUsersTokens(selectedAssociation, {transaction})
        const filteredTokens = tokens.filter(token => token !== selectedUser.pushNotificationToken)
        sendPushNotification(`${memberName} a payé une cotisation dans ${selectedAssociation.nom}`, filteredTokens, 'Payement cotisation', {notifType: 'cotisation', associationId: selectedAssociation.id})
       const data = {
           memberId: selectedMember.id, cotisations: memberCotisState
       }
        await transaction.commit()
        return res.status(200).send(data)
    } catch (e) {
        await transaction.rollback()
        next(e.message)
    }
}

const getMembersCotisations = async (req, res, next) => {
    try {
        const allMembers = await Member.findAll({
            where: {
                associationId: req.body.associationId
            }
        })
        let membersCotisation =  {}
        for(let i=0; i<allMembers.length; i++) {
            const selectedMember = allMembers[i];
            const memberId = selectedMember.id;
            const selectedMemberCotisations = await selectedMember.getCotisations();
            membersCotisation[memberId] = selectedMemberCotisations
        }
        return res.status(200).send(membersCotisation)
    } catch (e) {
        next(e.message)
    }
}

const getConnectedUserAssociations = async (req, res, next) => {
    const token = req.headers['x-access-token']
    const user = decoder(token)
    try {
        const connectedUser = await User.findByPk(user.id)
        if(!connectedUser)return res.status(404).send({message: "utilisateur non trouvé"})
        const userAssociations = await connectedUser.getAssociations()
        return res.status(200).send(userAssociations)
    } catch (e) {
        next(e)
    }
}
export {
    getSelectedAssociationMembers,
    addNewMember,
    respondToAdhesionMessage,
    updateMemberData,
    getMemberInfos,
    readInfo,
    sendMessageToAssociation,
    editImages,
    payCotisation,
    getMembersCotisations,
    getConnectedUserAssociations,
    getConnectedMemberUser

}