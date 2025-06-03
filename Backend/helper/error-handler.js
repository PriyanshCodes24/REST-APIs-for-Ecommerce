function errorHandler(err, req, res, next) {
    if (err.name === "UnauthorizedError") {
        return res.status(401).json({ msg: "User is not authorized" });
    }
    if (err.name === "ValidationError") {
        return res.status(401).json({ msg: err });
    }
    return res.status(500).json(err.msg);
}

module.exports = errorHandler;
