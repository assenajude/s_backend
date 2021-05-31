import decoder from 'jwt-decode'
import cryptoRandomString from "crypto-random-string";
import bcrypt from 'bcryptjs'
import db from '../../db/models/index.js'
const Op = db.Sequelize.Op
const Member = db.member
const User = db.user
const Informaton = db.information
const Association = db.association
const Member_Info = db.member_info

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
        const newMember = await Member.findByPk(associatedMember.id)
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

export {
    getAllMembers,
    getUserAssociations,
    addNewMember,
    respondToAdhesionMessage,
    updateMemberData,
    getMemberInfos,
    readInfo,
    sendMessageToAssociation,
    editImages
}