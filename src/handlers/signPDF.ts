import { Request, Response } from 'express';
import { addWaterMark } from '../helpers';

export const signPDF = async (req: Request, res: Response): Promise<void> => {
    const documentId = req.params.documentId;
    addWaterMark(documentId, res);
};
