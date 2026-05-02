import CustomAPIError from "../errors/custom-error.js"
import { StatusCodes } from "http-status-codes"

const errorHandlerMiddleware = (err, req, res, next) => {
    console.error(err)
    if (err instanceof CustomAPIError) {
        return res.status(err.statusCode).json({
            ok: false,
            error: { message: err.message }
        })
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        ok: false,
        error: { message: 'Internal server error' }
    })
}

export default errorHandlerMiddleware