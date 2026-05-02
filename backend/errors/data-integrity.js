import CustomAPIError from "./custom-error.js"
import { StatusCodes } from "http-status-codes"

class DataIntegrityError extends CustomAPIError {
    constructor(message) {
        super(message)
        this.statusCode = StatusCodes.INTERNAL_SERVER_ERROR
    }
}

export default DataIntegrityError