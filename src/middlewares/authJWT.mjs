import jwt from 'jsonwebtoken'
import db from '../../db/models/index.js'
const Member = db.member

const verifyToken = (req, res, next) => {
    const token = req.headers['x-access-token'];
    if(!token) return res.status(403).send('no token provided')

    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
        if(error) return res.status(401).send('vous netes pas autorisé')
        req.memberId = decoded.id
        next()
    })
}

const isAdmin = async (req, res, next) => {
    try {
        const member = await Member.findByPk(req.memberId)
        const memberRoles = await member.getRoles()
        for(let i=0; i< memberRoles.length; i++) {
            if(memberRoles[i].name === 'admin') {
                next()
                return;
            }
        }
        return res.status(403).send('role administrateur requis')
    } catch (e) {
        next(e)
    }
}

export {verifyToken, isAdmin}
