import db from '../../db/models/index.js'
const Op = db.Sequelize.Op
const Member = db.member
const Association = db.association
const Information = db.information

const addInfo = async (req, res, next) => {
    const data = {
        title: req.body.title,
        content: req.body.content,
        dateDebut: req.body.dateDebut?req.body.dateDebut: new Date(),
        dateFin: req.body.dateFin?req.body.dateFin: new Date()
    }
    try{
        const selectedAssociation = await Association.findByPk(req.body.associationId)
        let newInfo = await Information.create(data)
        await newInfo.setAssociation(selectedAssociation)
        const assoUsers = await selectedAssociation.getUsers()
        const currentMembers = assoUsers.filter(item => item.member.relation.toLowerCase() !== 'ondemand')
        const members = currentMembers.map(item => item.member)
        for(let i=0; i < members.length; i++) {
            const currentMember = members[i];
            (async function (newMember) {
                let selectedMember = await Member.findByPk(newMember.id)
                await selectedMember.addInformation(newInfo, {
                    through: {
                        isRead: false
                    }
                })
            })(currentMember)
        }
        return res.status(201).send(newInfo)
    } catch (e) {
        next(e.message)
    }
}

const getAllAssociationInfos = async (req, res, next) => {
    try{
        const informations = await Information.findAll({
            where: {
                associationId: req.body.associationId
            }
        })
        return res.status(200).send(informations)
    } catch (e) {
        next(e.message)
    }
}

export {
    addInfo,
    getAllAssociationInfos
}