import authRoutes from '../routes/auth.routes.mjs'
import associationRoutes from '../routes/association.routes.mjs'
import memberRoutes from '../routes/member.routes.mjs'
import cotisationRoutes from '../routes/cotisation.routes.mjs'
import engagementRoutes from '../routes/engagement.routes.mjs'
import informationRoutes from '../routes/information.routes.mjs'
import userRoutes from '../routes/user.routes.mjs'
import uploadImageRoutes from '../routes/uploadImage.route.mjs'
import transactionRoutes from '../routes/transaction.routes.mjs'

const routes = (app) => {
    app.use('/api/auth', authRoutes)
    app.use('/api/user', userRoutes)
    app.use('/api/associations', associationRoutes)
    app.use('/api/members', memberRoutes)
    app.use('/api/cotisations', cotisationRoutes)
    app.use('/api/engagements', engagementRoutes)
    app.use('/api/informations', informationRoutes)
    app.use('/api/uploadFile', uploadImageRoutes)
    app.use('/api/transactions', transactionRoutes)
}

export {routes}