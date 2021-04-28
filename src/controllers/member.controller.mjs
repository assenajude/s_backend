import decoder from 'jwt-decode'
import cryptoRandomString from "crypto-random-string";
import bcrypt from 'bcryptjs'
import db from '../../db/models/index.js'
const Member = db.member
const Association = db.association
const Associated_member = db.associated_member

const getMemberAssociations = async (req, res, next) => {
    const authToken = req.headers['x-access-token']
    const connectedUser = decoder(authToken)
    try {
        const selectedMember = await Member.findByPk(connectedUser.id)
        const memberAssociations = await selectedMember.getAssociations()
        return res.status(200).send(memberAssociations)
    } catch (e) {
        next(e)
    }
}

const addNewMember = async (req, res, next) => {

    try {
        const generatedPass = cryptoRandomString({length: 5, type: 'alphanumeric'})
        let newMember = await Member.create({
            nom: req.body.nom,
            prenom: req.body.prenom,
            email: req.body.email,
            phone: req.body.phone,
            adresse: req.body.adresse,
            fonds: req.body.fonds,
            password: bcrypt.hashSync(generatedPass, 8)
        })
        await newMember.setRoles[1]
        const idAssociation = req.body.associationId
        if(idAssociation) {
            let selectedAssociation = await Association.findByPk(idAssociation)
            await selectedAssociation.addMember(newMember, {
                through: {
                    relation: 'valid',
                    motif: 'adhesion',
                    messageSent: false
                }
            })
        }
        const newAdded = await Member.findByPk(newMember.id, {
            attributes: {exclude: ['password']},
            include: Association
        })

        return res.status(200).send({new: newAdded, randomPass: generatedPass})
    } catch (e) {
        next(e)
    }
}

const updateMemberState = async (req, res, next) => {
    try {
        let associatedMember = await Associated_member.findOne({
            where: {
                associationId: req.body.associationId,
                memberId: req.body.memberId
            }
        })
        associatedMember.messageSent = false
        associatedMember.relation = req.body.adminResponse
        await associatedMember.save()
        const newAssociations = await Association.findAll({
            include: [{model: Member, attributes:{exclude:['password']}}]
        })
        return res.status(200).send(newAssociations)
    } catch (e) {
        next(e)
    }
}

const getAssociationMembers = async (req, res, next) => {
    try {
        const selectedAssociation = await Association.findByPk(req.body.associationId)
        if(!selectedAssociation) return res.status(404).send("aucune association selectionnée")
        const members = await selectedAssociation.getMembers({attributes: {exclude: ['password']}})
        return res.status(200).send(members)
    } catch (e) {
        next(e)
    }
}


export {
    getMemberAssociations,
    addNewMember,
    updateMemberState,
    getAssociationMembers
}