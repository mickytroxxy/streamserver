import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IGetUserAuthInfoRequest } from '../dtos/types';

const secretKey = '7624API1!@';

export const authorize = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: 'No token provided, authorization denied' });
    }
    try {
        const data = jwt.verify(token, secretKey) as jwt.JwtPayload;
        (req as IGetUserAuthInfoRequest).user = data;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid token' });
    }
};

export const createToken = (phoneNumber: string) => jwt.sign({ phoneNumber, timeStamp: Date.now() }, secretKey);
