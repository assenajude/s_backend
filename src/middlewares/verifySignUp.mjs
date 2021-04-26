import db  from '../../db/models/index.js'
const ROLES = db.ROLES
const Member = db.member

const checkDuplicateUsernameOrEmail = async (req, res, next) => {
    try {
        const memberByUsername = await Member.findOne({
            where: {
                username: req.body.username
            }
        })
        if(memberByUsername) return res.status(400).send('Echec! ce nom utilisateur est deja pris.')

        const memberByEmail = await Member.findOne({
            where: {
                email: req.body.email
            }
        })
        if(memberByEmail) return res.status(400).send('Echec! email deja pris')

        next()
    } catch (e) {
        next(e.message)
    }
}

const checkRolesExisted = (req, res, next) => {
    const roles = req.body.roles
    if(roles) {
        for(let i= 0; i< roles.length; i++) {
            if(!ROLES.includes(roles[i])) {
                return res.status(400).send(`Le role ${roles[i]} n'existe pas`)
            }
        }
    }
    next()
}

export {checkDuplicateUsernameOrEmail, checkRolesExisted}