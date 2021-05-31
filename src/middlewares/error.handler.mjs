import logger from "../utilities/logger.mjs";

const errorHandler = async (error, req, res, next) => {
    let statusCode
    if(!error.statusCode) statusCode = 500
    else statusCode = error.statusCode
    logger.error(error.message)
    return res.status(statusCode).send({"error": error.message})
}

export {errorHandler}