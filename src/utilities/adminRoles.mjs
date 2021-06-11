import decoder from 'jwt-decode'


    const isAdminUser = (token) => {
        let isAdmin = false
        const user = decoder(token)
        const adminIndex = user.roles.findIndex(role => role.toLowerCase() === 'role_admin')
        if(adminIndex !== -1) isAdmin = true
        else isAdmin = false
        return isAdmin
    }

export {
    isAdminUser
}