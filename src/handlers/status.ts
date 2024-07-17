import { Request, Response } from 'express';
import { Test } from '../dtos/types';

export const getApiStatus = (req: Request, res: Response) => {
    return res.status(200).json({ status: 'Greetings, our API server is running smoothly!!!' });
};
