import db from '../../db/models/index.js'
const Op = db.Sequelize.Op
const Association = db.association
const Engagement = db.engagement
const Member = db.member

const addEngagement = async (req, res, next) => {
    const data = {
        libelle: req.body.libelle,
        montant: req.body.montant,
        progession: req.body.progression?req.body.progression:0,
        accord: req.body.accord?req.body.accord:false,
        echeance: req.body.echeance?req.body.echeance: new Date(),
        statut:req.body.status?req.body.status : 'en cours'
    }
    try {
        let newAdded = await Engagement.create(data)
        const selectedMember = await Member.findByPk(req.body.memberId)
        await newAdded.setMember(selectedMember)
        const justAdded = await Engagement.findByPk(newAdded.id, {
            include: Member
        })
        return res.status(200).send(justAdded)
    } catch (e) {
        next(e.message)
    }
}

const getEngagementsByAssociation = async (req, res, next) => {
    try {
        const selectedAssociation = await Association.findByPk(req.body.associationId)
        const allMembers = await selectedAssociation.getUsers()
        const memberIds = allMembers.map(item => item.id)
        const engagements = await Engagement.findAll({
            where: {
                memberId: {
                [Op.in]: memberIds
                }
            },
            include: [Member]
        })
        return res.status(200).send(engagements)
    } catch (e) {
        next(e.message)
    }
}
export {
    addEngagement,
    getEngagementsByAssociation
}