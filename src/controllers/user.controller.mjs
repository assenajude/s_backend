import db from '../../db/models/index.js'
const User = db.user

const editUserInfo = async (req, res, next) => {
    try {
        let selectedUer = await User.findByPk(req.body.id)
        if(!selectedUer) return res.status(404).send('Utilisateur non trouvé')
        if(req.body.nom) selectedUer.nom = req.body.nom
        if(req.body.prenom) selectedUer.prenom = req.body.prenom
        if(req.body.username) selectedUer.username = req.body.username
        if(req.body.phone) selectedUer.phone = req.body.phone
        if(req.body.email) selectedUer.email = req.body.email
        if(req.body.adresse) selectedUer.adresse = req.body.adresse
        await selectedUer.save()
        const justUpdated = await User.findByPk(selectedUer.id, {
            attributes: {exclude: ['password']}
        })
        return res.status(200).send(justUpdated)
    } catch (e) {
        next(e.message)
    }
}

const editFund = async (req, res, next) => {
    try {
        let selectedUser = await User.findByPk(req.body.id)
        if(!selectedUser) return res.status(404).send('Utilisateur non trouvé')
        selectedUser.wallet += Number(req.body.fonds)
        await selectedUser.save()
        return res.status(200).send(selectedUser)
    } catch (e) {
        next(e.message)
    }
}

const updateImages = async (req, res, next) => {
    try {
        let selectedUser = await User.findByPk(req.body.userId)
        if(!selectedUser) return res.status(200).send("utilisateur non trouvé")
        if(req.body.avatarUrl.length>0) {
            selectedUser.avatar = req.body.avatarUrl
        }
        if (req.body.pieces.length>0) {
            selectedUser.piece = req.body.pieces
        }
        await selectedUser.save()
        const justUpdated = await User.findByPk(selectedUser.id, {
            attributes: {exclude: ['password']}
        })
        return res.status(200).send(justUpdated)
    } catch (e) {
        next(e.message)
    }
}

export {
    editUserInfo,
    editFund,
    updateImages
}