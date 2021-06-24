import jwt from 'jsonwebtoken'
import db from '../../db/models/index.js'
const User = db.user
const Member = db.member

const verifyToken = (req, res, next) => {
    const token = req.headers['x-access-token'];
    if(!token) {
        return res.status(403).send('no token provided')
    }

    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
        if(error) return res.status(401).send('vous netes pas autorisé')
        req.userId = decoded.id
        if(req.body.associationId) req.associationId = req.body.associationId
        next()
    })
}


const isAdmin = async (req, res, next) => {
        const user = await User.findByPk(req.userId)
        const userRoles = await user.getRoles()
        for(let i=0; i< userRoles.length; i++) {
            if (userRoles[i].name === 'admin') {
                next();
                return;
            }
        }
        res.status(403).send('role administrateur requis')
}

const isModerator = async (req, res, next) => {
        const user = await User.findByPk(req.userId);
        const userRoles = await user.getRoles();
        let memberRoles;
        if(req.associationId) {
            const selectedMember = await Member.findOne({
                where: {
                    associationId: req.associationId,
                    userId: req.userId
                }
            })
            memberRoles = await selectedMember.getRoles()
        }
        const roles = [...userRoles, ...memberRoles]

         for (let i = 0; i < roles.length; i++) {
                if (roles[i].name === "moderator") {
                    next();
                    return;
                }
            }
        res.status(403).send({message: 'Role moderateur requis'});
}

const isAdminOrModerator = async (req, res, next) => {
        const user = await User.findByPk(req.userId);
         const userRoles = await user.getRoles();
         let memberRoles = [];
         if(req.associationId) {
             const selectedMember = await Member.findOne({
                 where: {
                     associationId: req.associationId,
                     userId: req.userId
                 }
             })
             memberRoles = await selectedMember.getRoles()
         }
        const roles = [...userRoles, ...memberRoles]
            for (let i = 0; i < roles.length; i++) {
                    if (roles[i].name === "moderator") {
                        next();
                        return;
                    }
                    if (roles[i].name === "admin") {
                        next();
                        return;
                    }
                }
        res.status(403).send({message: `role administrateur ou moderateur requis`})
}

export {verifyToken, isAdmin, isModerator, isAdminOrModerator}
