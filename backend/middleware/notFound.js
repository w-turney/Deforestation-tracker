const notFoundMiddleware = (req, res) => {
    res.status(404).json({
        ok: false,
        error: { message: 'Route does not exist' }
    })
}

export default notFoundMiddleware