import db from '../../db/models/index.js'
const Op = db.Sequelize.Op
const Cotisation = db.cotisation
const Association = db.association
const Member = db.member
const User = db.user

const addCotisation = async (req, res, next) => {
    const currentMontant = Number(req.body.montant)
    const data = {
        montant: currentMontant,
        motif: req.body.motif,
        datePayement: req.body.datePayement?req.body.datePayement: new Date()
    }
    try {
        let selectedMember = await Member.findByPk(req.body.memberId)
        let selectedUser = await User.findByPk(selectedMember.userId)
        if(!selectedUser) return res.status(404).send("L'utilisateur n'existe pas")
        if(selectedUser.wallet<currentMontant) return res.status(403).send("Fonds insuffisant")
        let selectedAssociation = await Association.findByPk(req.body.associationId)
        let newCotisation = await Cotisation.create(data)
        await newCotisation.setMember(selectedMember)
        selectedMember.fonds += currentMontant
        selectedUser.wallet -= currentMontant
        selectedAssociation.fondInitial += currentMontant
        await selectedUser.save()
        await selectedMember.save()
        await selectedAssociation.save()
        const justAdded = await Cotisation.findByPk(newCotisation.id, {
            include: Member
        })
        return res.status(200).send(justAdded)
    } catch (e) {
        next(e)
    }
}

const getAssociationCotisations = async (req, res, next) => {
    try {
        const selectedAssociation = await Association.findByPk(req.body.associationId)
       const allMembers = await selectedAssociation.getUsers()
        const memberIds = allMembers.map(item => item.id)
        const allCotisations = await Cotisation.findAll({
            where: {
                memberId: {
                    [Op.in]:memberIds
                }
            },
            include: Member
        })
        return res.status(200).send(allCotisations)
    } catch (e) {
        next(e)
    }
}

export {
    addCotisation,
    getAssociationCotisations
}