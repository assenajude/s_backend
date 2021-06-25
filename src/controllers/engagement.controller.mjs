import db from '../../db/models/index.js'
import dayjs from "dayjs";
import {getUsersTokens, sendPushNotification} from "../utilities/pushNotification.mjs";
const Op = db.Sequelize.Op
const Association = db.association
const Engagement = db.engagement
const Member = db.member
const Tranche = db.tranche
const User = db.user

const addEngagement = async (req, res, next) => {
    const data = {
        libelle: req.body.libelle,
        typeEngagement: req.body.typeEngagement,
        progession: req.body.progression?req.body.progression:0,
        accord: req.body.accord?req.body.accord:false,
        echeance: req.body.echeance?req.body.echeance: new Date(),
        statut:req.body.status?req.body.status : 'voting'
    }
    const transaction =await db.sequelize.transaction()
    try {
        const selectedMember = await Member.findByPk(req.body.memberId, {transaction})
        const selectedAssociation = await Association.findByPk(req.body.associationId, {transaction})
        if(!selectedAssociation) return res.status(404).send({message: 'association non trouvé'})
        if(!selectedMember)return res.status(404).send({message: 'utilisateur nom trouvé'})
        let newAdded = await Engagement.create(data, {transaction})
        await newAdded.setCreator(selectedMember, {transaction})
        const currentMontant = Number(req.body.montant)
        const interet = selectedAssociation.interetCredit / 100
        const interetValue = interet * currentMontant
        newAdded.montant = currentMontant
        newAdded.interetMontant = interetValue
        await newAdded.save({transaction})
        const totalMontant = currentMontant + interetValue
        if(req.body.typeEngagement.toLowerCase() === 'remboursable') {
            const today = dayjs()
            const ended = dayjs(req.body.echeance)
            let diff = ended.diff(today, 'hours')
            const days = Math.floor(diff / 24)
            let trancheMontant = 0
            const result = days/30
            let nbTranche = Math.trunc(result)
            const reste = totalMontant % nbTranche
            if(nbTranche>1) {
                trancheMontant = Math.trunc(totalMontant/nbTranche)
                let trancheEcheance = dayjs()
                const currentMonth = trancheEcheance.get('month')
                for(let i=0; i< nbTranche; i++) {
                    const newEcheance = trancheEcheance.set('month', currentMonth+i+1)
                    const newTranche = {
                        montant: trancheMontant,
                        libelle: `Engagement ${newAdded.id} tranche n° ${i+1}`,
                        solde: 0,
                        echeance:newEcheance
                    };
                    (async function(tranche) {
                        let addedTranche = await newAdded.createTranche(tranche)
                        if(i===0) {
                            addedTranche.montant += reste
                            await addedTranche.save({transaction})
                        }
                    })(newTranche)
                }
            } else {
                trancheMontant = totalMontant
                await newAdded.createTranche({
                    libelle: `Engagement ${newAdded.id} tranche n° 1`,
                    solde: 0,
                    montant: trancheMontant,
                    echeance: req.body.echeance
                }, {transaction})
            }

        }
        await transaction.commit()
        const justAdded = await Engagement.findByPk(newAdded.id, {
            include: [{model: Member, as: 'Creator'}]
        })
        const tokens = await getUsersTokens(selectedAssociation)
        const selectedUser = await User.findByPk(selectedMember.userId)
        const filteredTokens = tokens.filter(token => token !== selectedUser.pushNotificationToken)
        sendPushNotification(`Un nouvel engagement a été ajouté dans ${selectedAssociation.nom} `, filteredTokens, "Nouvel engagement.", {notifType: 'engagement', associationId: selectedAssociation.id})
        return res.status(200).send(justAdded)
    } catch (e) {
        await transaction.rollback()
        next(e.message)
    }
}

const validEngagement = async (req, res,next) => {
    try{
        let selectedEngagement = await Engagement.findByPk(req.body.id)
        selectedEngagement.accord = req.body.accordEngagement
        await selectedEngagement.save()
        const justUpdated = await Engagement.findByPk(selectedEngagement.id, {
            include: [Member, Tranche]
        })
        const selectedMember = await Member.findByPk(selectedEngagement.memberId)
        const selectedUser = await User.findByPk(selectedMember.userId)
        const userToken = selectedUser.pushNotificationToken
        sendPushNotification(`Votre engagement '${selectedEngagement.libelle - selectedEngagement.montant}' a changé de status.`, [userToken], "changement status engagement.", {notifType: 'engagement', associationId: selectedMember.associationId})
        return res.status(200).send(justUpdated)
    } catch (e) {
        next(e.message)
    }
}

const updateEngagement = async (req, res, next) => {
    try {
        let selected = await Engagement.findByPk(req.body.id)
        await selected.update({
            libelle: req.body.libelle,
            statut:req.body.statut
        })
        let selectedMember = await Member.findByPk(selected.creatorId)
        let selectedUser = await User.findByPk(selectedMember.userId)
        let selectedAssociation = await Association.findByPk(selectedMember.associationId)
        if(req.body.statut === 'paying') {
            const securityFund = selectedAssociation.fondInitial * selectedAssociation.seuilSecurite/100
            const dispoFund = selectedAssociation.fondInitial-securityFund
            if(selected.montant > dispoFund) {
                selected.statut = 'pending'
            } else {
                selectedAssociation.fondInitial -= selected.montant
                selectedUser.wallet += selected.montant
                selectedMember.fonds -= selected.montant
            }
        }
        await selectedAssociation.save()
        await selected.save()
        await selectedUser.save()
        await selectedMember.save()
        const justUpdated = await Engagement.findByPk(selected.id, {
            include: [{model: Member, as: 'Creator'}, Tranche]
        })
        const userToken = selectedUser.pushNotificationToken
        sendPushNotification(`Votre engagement '${selected.libelle} - ${selected.montant}' a été mis à jour.`, [userToken], "Mis à jour engagement.", {notifType: 'engagement', associationId: selectedMember.associationId})
        return res.status(200).send(justUpdated)
    } catch (e) {
        next(e.message)
    }
}

const getEngagementsByAssociation = async (req, res, next) => {
    try {
        const allMembers = await Member.findAll({
            where: {
                associationId: req.body.associationId
            }
        })
        const memberIds = allMembers.map(item => item.id)

        const engagements = await Engagement.findAll({
            where: {
                creatorId: {
                [Op.in]: memberIds
                }
            },
            include: [{model: Member, as: 'Creator'}, Tranche]
        })
        return res.status(200).send(engagements)
    } catch (e) {
        next(e.message)
    }
}

const voteEngagement = async (req, res, next) => {
    const transaction =await db.sequelize.transaction()
    try{
        let engagement = await Engagement.findByPk(req.body.id, {transaction})
        if(!engagement) return res.status(404).send({message: 'engagement non trouvé'})
        const votor = await Member.findByPk(req.body.votorId, {transaction})
        if(!votor)return res.status(404).send({message: 'votant non trouvé'})
        await engagement.addVotor(votor, {
            through: {
                typeVote: req.body.typeVote
            }
        }, {transaction})

        let selectedAssociation = await Association.findByPk(req.body.associationId, {transaction})
        const allMembers = await selectedAssociation.getUsers({transaction})
        let numberToVote = 0
        const validMembers = allMembers.filter(item => item.member.relation.toLowerCase() === 'member' || item.member.relation.toLowerCase() === 'onleave')
        if(selectedAssociation.validationLenght >0) {
            numberToVote = selectedAssociation.validationLenght
        } else if(validMembers.length <= 10) {
            numberToVote =  validMembers.length
        } else {
             numberToVote = Math.ceil(validMembers.length / 3)
        }
        const engagementVotes = await engagement.getVotor({transaction})
        const selectedMember = await Member.findByPk(engagement.creatorId, {transaction})
        let selectedUser = await User.findByPk(selectedMember.userId, {transaction})
        if(numberToVote === engagementVotes.length) {
            const upVotes = engagementVotes.filter(engageVote => engageVote.vote.typeVote.toLowerCase() === 'up')
            const downVotes = engagementVotes.filter(engageVote => engageVote.vote.typeVote.toLowerCase() === 'down')
            if(upVotes.length>downVotes.length) {
                engagement.accord = true
                const securityFund = selectedAssociation.fondInitial * selectedAssociation.seuilSecurite/100
                const dispoFund = selectedAssociation.fondInitial-securityFund
                if(engagement.montant > dispoFund) {
                    engagement.statut = 'pending'
                } else {
                    selectedAssociation.fondInitial -= engagement.montant
                    engagement.statut = 'paying'
                    selectedUser.wallet += engagement.montant
                    selectedMember.fonds -= engagement.montant
                }
            } else {
                engagement.accord = false
                engagement.statut = 'rejected'
            }
        }
            await selectedAssociation.save({transaction})
            await engagement.save({transaction})
            await selectedUser.save({transaction})
            await selectedMember.save({transaction})
        const justVoted = await Engagement.findByPk(engagement.id,{
            include: [{model: Member, as: 'Creator'}, Tranche],
            transaction
        })
        const data = {
            engagement: justVoted,
            engagements: engagementVotes
        }
        const userToken = selectedUser.pushNotificationToken
        const userVotor = await User.findByPk(votor.userId, {transaction})
        const votorName = userVotor.username?userVotor.username : userVotor.prenom
        if(selectedUser.id !== userVotor.id) {
            sendPushNotification(`${votorName} a voté votre engegement '${engagement.libelle} - ${engagement.montant}'.`, [userToken], "engagement voté", {notifType: 'engagement', associationId: selectedAssociation.id})
        }
        await transaction.commit()
        return res.status(200).send(data)
    } catch (e) {
        await transaction.rollback()
        next(e.message)
    }
}


const getEngagementVotes = async (req, res, next) => {
    try {
        const allMembers = await Member.findAll({
            where: {
                associationId: req.body.associationId
            }
        })
        const memberIds = allMembers.map(item => item.id)

        const allEngagements = await Engagement.findAll({
            where: {
                creatorId: {
                    [Op.in]:memberIds
                }
            }
        })
        let allVotes = {}
            for(let i=0; i<allEngagements.length; i++) {
                const newItem = allEngagements[i];
                const engageVotes = await newItem.getVotor()
                allVotes[newItem.id] = engageVotes
            }

        return res.status(200).send(allVotes)
    } catch (e) {
        next(e.message)
    }

}

const payTranche = async(req, res, next) => {
    const montantToPay = Number(req.body.montant)
    const transaction =await db.sequelize.transaction()
    try {
        let selectedTranche = await Tranche.findByPk(req.body.id, {transaction})
        if(!selectedTranche) return res.status(404).send({message: "tranche non trouvée"})
        await selectedTranche.createPayement({
            montant: montantToPay,
            libelle: `Payement sur tranche`
        }, {transaction})
        selectedTranche.solde += montantToPay
        let selectedEngagement = await Engagement.findByPk(req.body.engagementId, {transaction})
        let selectedUser = await User.findByPk(req.body.userId, {transaction})
        if(!selectedUser) return res.status(404).send("Utilisateur non trouvé")
        if(selectedUser.wallet<montantToPay) return res.status(400).send("Fonds insuffisant")
        selectedUser.wallet -= montantToPay
        const totalMontant = selectedEngagement.interetMontant + selectedEngagement.montant
        selectedEngagement.solde += montantToPay
        const currentProgress = montantToPay/totalMontant
        const convertProgress = currentProgress.toFixed(1)
        selectedEngagement.progression += Number(convertProgress)
        let memberFundToAdded = montantToPay
        if(selectedEngagement.solde === totalMontant) {
            selectedEngagement.progression = 1
           selectedEngagement.statut = 'ended'
            memberFundToAdded = montantToPay - selectedEngagement.interetMontant
        }
        let selectedMember = await Member.findByPk(selectedEngagement.creatorId, {transaction})
        selectedMember.fonds += memberFundToAdded
        let selectedAssociation = await Association.findByPk(selectedMember.associationId, {transaction})
        selectedAssociation.fondInitial += montantToPay
        await selectedEngagement.save({transaction})
        await selectedTranche.save({transaction})
        await selectedUser.save({transaction})
        await selectedMember.save({transaction})
        await selectedAssociation.save({transaction})
        await transaction.commit()
        const tokens = getUsersTokens(selectedAssociation)
        sendPushNotification(`Un payement d'engagement a été fait dans ${selectedAssociation.nom}`, tokens, "Payement tranche engagement", {notifType: 'engagement', associationId: selectedMember.associationId})
        return res.status(200).send(selectedTranche)
    } catch (e) {
        await transaction.rollback()
        next(e.message)
    }
}

const getSelectedEngagement = async (req, res, next) => {
    try {
        const selectedEngagement = await Engagement.findByPk(req.body.engagementId, {
            include: [{model: Member, as: 'Creator'}, Tranche]
        })
        if(!selectedEngagement)return res.status(200).send("engagement non trouvé.")
        return res.status(200).send(selectedEngagement)
    } catch (e) {
        next(e.message)
    }
}

const deleteEngagement = async (req, res, next) => {
    try {
        let selectedEngagement = await Engagement.findByPk(req.body.engagementId)
        if(!selectedEngagement)return res.status(404).send("Engagement introuvable.")
        if(selectedEngagement.accord === false && selectedEngagement.solde === 0) {
            await selectedEngagement.destroy()
        } else if(selectedEngagement.accord === true && selectedEngagement.statut === 'pending' && selectedEngagement.solde === 0) {
            await selectedEngagement.destroy()
        }else {
            return res.status(403).send("Impossible de supprimer cet engagement.")
        }
        return res.status(200).send({engagementId: req.body.engagementId})
    } catch (e) {
        next(e.message)
    }
}

export {
    addEngagement,
    getEngagementsByAssociation,
    validEngagement,
    updateEngagement,
    voteEngagement,
    getEngagementVotes,
    payTranche,
    getSelectedEngagement,
    deleteEngagement
}