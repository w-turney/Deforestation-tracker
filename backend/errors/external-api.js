import CustomAPIError from "./custom-error.js"
import { StatusCodes } from "http-status-codes"
class ExternalApiError extends CustomAPIError {
    constructor(message) {
        super(message)
        this.statusCode = StatusCodes.BAD_GATEWAY
    }
}

export default ExternalApiError