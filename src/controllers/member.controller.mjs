import decoder from 'jwt-decode'
import cryptoRandomString from "crypto-random-string";
import db from '../../db/models/index.js'
const Member = db.member
const User = db.user
const Association = db.association
const Cotisation = db.cotisation
const Member_Info = db.member_info
const Member_Cotisation = db.member_cotisation

const getAllMembers = async (req, res, next) => {
    try {
        const members = await Member.findAll()
        return res.status(200).send(members)
    } catch (e) {
        next(e.message)
    }
}

const getUserAssociations = async (req, res, next) => {
    const authToken = req.headers['x-access-token']
    const connectedUser = decoder(authToken)
    try {
        const selectedUser = await User.findByPk(connectedUser.id)
        const memberAssociations = await selectedUser.getAssociations()
        return res.status(200).send(memberAssociations)
    } catch (e) {
        next(e)
    }
}

const addNewMember = async (req, res, next) => {
    try {
        const generatedPass = cryptoRandomString({length: 5, type: 'alphanumeric'})
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
        if(!connectedUser) return res.status(404).send("utilisation non trouvé")
        await selectedAssociation.addUser(connectedUser, {
            through: {
                relation:req.body.relation?req.body.relation : 'onDemand'
            }
        })

        const members = await Member.findAll()
        return res.status(200).send(members)
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
    try {
        let selectedMember = await Member.findByPk(req.body.memberId)
        if(!selectedMember) return res.status(404).send("Membre non trouvée")
        let selectedUser = await User.findByPk(selectedMember.userId)
        if(!selectedUser) return res.status(404).send("L'utilisateur n'existe pas")
        if(selectedUser.wallet<montantToPay) return res.status(403).send("Fonds insuffisant")
        let selectedCotisation = await Cotisation.findByPk(req.body.cotisationId)
        if(!selectedCotisation) return res.status(404).send("cette cotisation nexiste pas")
        let selectedAssociation = await Association.findByPk(selectedCotisation.associationId)
        if(!selectedAssociation) return res.status(404).send("association non trouvée")
        await selectedMember.addCotisation(selectedCotisation, {
            through: {
                montant: montantToPay,
                paymentDate: new Date()
            }
        })
        let newPayed = await Member_Cotisation.findOne({
            where: {
                memberId: selectedMember.id,
                cotisationId: selectedCotisation.id
            }
        })
        if(montantToPay >= selectedCotisation.montant) {
            newPayed.isPayed = true
        }
        if(selectedCotisation.typeCotisation.toLowerCase() === 'mensuel') {
            selectedMember.fonds += montantToPay
        }
        selectedAssociation.fondInitial += montantToPay
        selectedUser.wallet -= montantToPay

        await newPayed.save()
        await selectedMember.save()
        await selectedUser.save()
        await selectedAssociation.save()
        const memberCotisState = await selectedMember.getCotisations()
        return res.status(200).send({memberId: selectedMember.id, cotisations: memberCotisState})
    } catch (e) {
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
            const selectedMember = allMembers[i]
            const memberId = selectedMember.id
            const selectedMemberCotisations = await selectedMember.getCotisations()
            membersCotisation[memberId] = selectedMemberCotisations
        }
        return res.status(200).send(membersCotisation)
    } catch (e) {
        next(e.message)
    }
}

export {
    getAllMembers,
    getUserAssociations,
    addNewMember,
    respondToAdhesionMessage,
    updateMemberData,
    getMemberInfos,
    readInfo,
    sendMessageToAssociation,
    editImages,
    payCotisation,
    getMembersCotisations
}