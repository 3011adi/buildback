export function isAuthenticated(req, res, next) {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ 
        message: 'Not authenticated',
        redirectTo: '/login'
      });
    }
    
    if (typeof next === 'function') {
      return next();
    }
    
    return true;
  }