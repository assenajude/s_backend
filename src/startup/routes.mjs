import {verifyToken, isAdmin} from '../middlewares/authJWT.mjs'
import authRoutes from '../routes/auth.routes.mjs'
import associationRoutes from '../routes/association.routes.mjs'
import memberRoutes from '../routes/member.routes.mjs'

const routes = (app) => {
    app.use('/api/auth', authRoutes)
    app.use('/api/associations', associationRoutes)
    app.use('/api/members', memberRoutes)
}

export {routes}