import jwt from 'jsonwebtoken'
import bcryp from 'bcryptjs'

import db from '../../db/models/index.js'
const Member = db.member
const Role = db.role
const Op = db.Sequelize.Op

const signup = async (req, res, next) => {
    try {
        let member = await Member.create({
            username: req.body.username,
            email: req.body.email,
            password: bcryp.hashSync(req.body.password, 8)
        })
        const roles = req.body.roles
        if(roles) {
            const memberRoles = await Role.findAll({
                where: {
                    name: {
                        [Op.or]: roles
                    }
                }
            })
            await member.setRoles(memberRoles)
            return res.status(201).send("L'utilisateur a été enregistré avec succès")
        } else {
            await member.setRoles([1])
            return res.status(201).send("L'utilisateur a été enregistré avec succès")
        }
    } catch (e) {
        next(e)
    }
}


const signin = async (req, res, next) => {
    try {
        let currentMember;
        if(req.body.username) {
        currentMember = await Member.findOne({
            where: {
                username: req.body.username
            }
        })
        }
        if(req.body.email) {
        currentMember = await Member.findOne({
            where: {
                email: req.body.email
            }
        })

        }

        if(!currentMember) return res.status(404).send('Membre nom trouvé')
        const passwordIsValid = bcryp.compareSync(req.body.password,currentMember.password)
        if(!passwordIsValid) {
            return res.status(401).send({
                accesstoken: null,
                message: 'invalid password'
            })
        }
        let token = jwt.sign({id: currentMember.id}, process.env.JWT_SECRET, {
            expiresIn: 86400
        })

        let authorities = []
        const memberRoles = await currentMember.getRoles()
        for(let i=0; i<memberRoles.length; i++) {
            authorities.push("ROLE_" + memberRoles[i].name.toUpperCase())
        }
        return res.status(201).send({
            id: currentMember.id,
            username: currentMember.username,
            email: currentMember.email,
            roles: authorities,
            accessToken: token
        })
    } catch (e) {
        next(e)
    }
}

export {signup, signin}