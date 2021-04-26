import decoder from 'jwt-decode'
import db from '../../db/models/index.js'
const Member = db.member

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



export {
    getMemberAssociations,
}