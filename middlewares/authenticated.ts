import { Request, Response, NextFunction } from 'express';

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.method == "POST") return next()
    if (req.session && req.session.user) {
        if (req.path == "/auth") {
            return res.redirect('/profile')
        }
        return next();
    } 
    if (req.path.startsWith("/auth")) return next();
    return res.redirect('/auth');
    
};
