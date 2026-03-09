/**
 * Middleware factory that checks if the authenticated user has at least one
 * of the allowed roles. Must be used after verifyJWT (which sets req.roles).
 *
 * Usage: verifyRoles(ROLES.Admin, ROLES.Finance_Admin)
 */
const verifyRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req?.roles) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const hasRole = req.roles.some((role) => allowedRoles.includes(role));
    if (!hasRole) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};

module.exports = verifyRoles;
