import jwt from 'jsonwebtoken'
import db from '../../db/models/index.js'
const User = db.user

const verifyToken = (req, res, next) => {
    const token = req.headers['x-access-token'];
    if(!token) return res.status(403).send('no token provided')

    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
        if(error) return res.status(401).send('vous netes pas autorisé')
        req.userId = decoded.id
        next()
    })
}

const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.userId)
        const userRoles = await user.getRoles()
        for(let i=0; i< userRoles.length; i++) {
            if(userRoles[i].name === 'admin') {
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
