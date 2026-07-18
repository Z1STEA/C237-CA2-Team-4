function isAdmin(req, res, next) {

    if (
        req.session.user &&
        req.session.user.role === "admin"
    ) {
        return next();
    }

    res.status(403).send("Access Denied");

}

module.exports = isAdmin;