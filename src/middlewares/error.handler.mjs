import logger from "../utilities/logger.mjs";

const errorHandler = async (error, req, res, next) => {
    if(!error.statusCode) error.statusCode = 500
    logger.error(error.message)
    return res.status(error.statusCode).send({"error": error.message})
}

export {errorHandler}