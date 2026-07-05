export const adminOnly = (req, res, next) => {
  if (req.user?.role === 'admin') {
    next();
  } else {
    res.status(403);
    next(new Error('Access denied. Admin privileges required.'));
  }
};
