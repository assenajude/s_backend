import db from '../../db/models/index.js'
import decoder from 'jwt-decode'
import genCode from 'crypto-random-string'
const User = db.user
const Transaction = db.transaction
import {sendPushNotification} from '../utilities/pushNotification.mjs'
import {isAdminUser} from '../utilities/adminRoles.mjs'

const addTransaction = async (req, res, next) => {
    const data = {
        libelle: req.body.libelle,
        montant: req.body.montant,
        reseau: req.body.reseau,
        typeTransac: req.body.type,
        numero: req.body.numero,
        statut: req.body.statut?req.body.statut : 'processing'
    }
    const transaction =await db.sequelize.transaction()
    try {
        const selectedUser = await User.findByPk(req.body.userId, {transaction})
        if(!selectedUser) return res.status(404).send("Utilisateur non trouvé")
        let newTransaction = await Transaction.create(data, {transaction})
        const transactionNumber = genCode({length: 8, type: 'numeric'})
        newTransaction.number = `T-${transactionNumber}`
        newTransaction.setUser(selectedUser)
        await newTransaction.save({transaction})
        await transaction.commit()
        const justAdded = await Transaction.findByPk(newTransaction.id, {
            include: [{model:User, attributes: {exclude: ['password']}}]
        })

        const allUsers = await User.findAll()
        const adminUsers = []
        for(let i=0; i<allUsers.length; i++) {
            const currentUser = allUsers[i]
            const userRoles = await currentUser.getRoles()
            userRoles.forEach(userRole => {
                if(userRole.name === 'admin') adminUsers.push(currentUser)
            })
        }
        const usersTokens = adminUsers.map(user => user.pushNotificationToken)
        sendPushNotification("Nouvelle transacton en cours", usersTokens, newTransaction.typeTransac, {notifType: 'transaction', mode: newTransaction.typeTransac})
        return res.status(200).send(justAdded)
    } catch (e) {
        await transaction.rollback()
        next(e.message)
    }
}


const updateTransaction = async (req, res, next) => {
    const montant = Number(req.body.montant)
    const transaction =await db.sequelize.transaction()
    try {
        let selectedTransaction = await Transaction.findByPk(req.body.transactionId, {transaction})
        if(!selectedTransaction) return res.status(200).send("transaction non trouvée")
        if(req.body.typeTransac) selectedTransaction.typeTransac = req.body.typeTransac
        if(req.body.libelle) selectedTransaction.libelle = req.body.libelle
        if(req.body.reseau) selectedTransaction.reseau = req.body.reseau
        if(req.body.numero) selectedTransaction.numero = req.body.numero
        let selectedUser = await User.findByPk(req.body.userId, {transaction})
        if(req.body.statut) {
            selectedTransaction.statut = req.body.statut
            if(req.body.statut.toLowerCase() === 'succeeded') {
                    if(!selectedUser) return res.status(404).send({message: "Utilisateur non trouvé"})
                if(req.body.typeTransac.toLowerCase() === 'depot') {
                    selectedUser.wallet += montant
                } else {
                    if(selectedUser.wallet < montant) {
                        return res.status(403).send({message: "fonds insuffisant"})
                    }
                    selectedUser.wallet -= montant
                }
                await selectedUser.save({transaction})
            }
        }
        await selectedTransaction.save({transaction})
        await transaction.commit()
        const justUpdated = await Transaction.findByPk(selectedTransaction.id, {
            include: [{model: User, attributes: {exclude: ['password']}}]
        })
        const userToken = selectedUser.pushNotificationToken
        sendPushNotification("Votre transaction a été traitée.", [userToken], 'Transaction traitée.', {notifType: 'Transaction', mode: selectedTransaction.typeTransac})
        return res.status(200).send(justUpdated)
    } catch (e) {
        await transaction.rollback()
        next(e.message)
    }
}

const getUserTransaction = async (req, res, next) => {
    const token = req.headers['x-access-token']
    const isAdmin = isAdminUser(token)
    try {
        let userTransactions = []
        if(isAdmin) {
        userTransactions = await Transaction.findAll({
            include: [{model: User, attributes: {exclude: ['password']}}]
        })
        } else {
            userTransactions = await Transaction.findAll({
                where: {
                    userId: req.body.userId
                },
                include: [{model: User, attributes: {exclude: ['password']}}]
            })
        }
        return res.status(200).send(userTransactions)
    } catch (e) {
        next(e.message)
    }
}

export {
    addTransaction,
    updateTransaction,
    getUserTransaction
}