import db from '../../db/models/index.js'
const Op = db.Sequelize.Op
const Cotisation = db.cotisation
const Association = db.association
const Member = db.member

const addCotisation = async (req, res, next) => {
    const data = {
        montant: req.body.montant,
        motif: req.body.motif,
        datePayement: req.body.datePayement?req.body.datePayement: new Date()
    }
    try {
        let selectedMember = await Member.findByPk(req.body.memberId)
        let selectedAssociation = await Association.findByPk(req.body.associationId)
        let newCotisation = await Cotisation.create(data)
        await newCotisation.setMember(selectedMember)
        selectedMember.fonds += req.body.montant
        selectedMember.fonds += req.body.montant
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