const roles = (...rolesAutorises) => {
  return (req, res, next) => {
    if (!rolesAutorises.includes(req.user.role)) {
      return res.status(403).json({
        message: `Accès refusé — rôle ${req.user.role} non autorisé`
      });
    }
    next();
  };
};

module.exports = roles;