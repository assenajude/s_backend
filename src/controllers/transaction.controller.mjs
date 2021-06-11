import db from '../../db/models/index.js'
import decoder from 'jwt-decode'
import genCode from 'crypto-random-string'
const User = db.user
const Transaction = db.transaction

const addTransaction = async (req, res, next) => {
    const data = {
        libelle: req.body.libelle,
        montant: req.body.montant,
        reseau: req.body.reseau,
        typeTransac: req.body.type,
        numero: req.body.numero,
        statut: req.body.statut?req.body.statut : 'processing'
    }
    try {
        const selectedUser = await User.findByPk(req.body.userId)
        if(!selectedUser) return res.status(404).send("Utilisateur non trouvé")
        let newTransaction = await Transaction.create(data)
        const transactionNumber = genCode({length: 8, type: 'numeric'})
        newTransaction.number = `T-${transactionNumber}`
        newTransaction.setUser(selectedUser)
        await newTransaction.save()
        const justAdded = await Transaction.findByPk(newTransaction.id, {
            include: [{model:User, attributes: {exclude: ['password']}}]
        })
        return res.status(200).send(justAdded)
    } catch (e) {
        next(e.message)
    }
}


const updateTransaction = async (req, res, next) => {
    const montant = Number(req.body.montant)
    try {
        let selectedTransaction = await Transaction.findByPk(req.body.transactionId)
        if(!selectedTransaction) return res.status(200).send("transaction non trouvée")
        if(req.body.typeTransac) selectedTransaction.typeTransac = req.body.typeTransac
        if(req.body.libelle) selectedTransaction.libelle = req.body.libelle
        if(req.body.reseau) selectedTransaction.reseau = req.body.reseau
        if(req.body.numero) selectedTransaction.numero = req.body.numero
        if(req.body.statut) {
            selectedTransaction.statut = req.body.statut
            if(req.body.statut.toLowerCase() === 'succeed') {
                let selectedUser = await User.findByPk(req.body.userId)
                    if(!selectedUser) return res.status(404).send({message: "Utilisateur non trouvé"})
                if(req.body.typeTransac.toLowerCase() === 'depot') {
                    selectedUser.wallet += montant
                } else {
                    if(selectedUser.wallet < montant) {
                        return res.status(403).send({message: "fonds insuffisant"})
                    }
                    selectedUser.wallet -= montant
                }
                await selectedUser.save()
            }
        }
        await selectedTransaction.save()
        const justUpdated = await Transaction.findByPk(selectedTransaction.id, {
            include: [{model: User, attributes: {exclude: ['password']}}]
        })
        return res.status(200).send(justUpdated)
    } catch (e) {
        next(e.message)
    }
}

const getUserTransaction = async (req, res, next) => {
    const token = req.headers['x-access-token']
    const user = decoder(token)
    const userRoles = user.roles
    const isAdminIndex = userRoles.findIndex(role => role === 'ROLE_ADMIN')
    try {
        let userTransactions = []
        if(isAdminIndex !== -1) {
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