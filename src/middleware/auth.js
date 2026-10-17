/**
 * Middleware Autentikasi Admin Tunggal
 */

function requireAuth(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  return res.redirect('/login');
}

function redirectIfAuth(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return res.redirect('/');
  }
  return next();
}

module.exports = {
  requireAuth,
  redirectIfAuth
};
