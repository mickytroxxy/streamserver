import { Request, Response } from 'express';
import { getDocumentsApi } from '../helpers/api';

export const getDocuments = async (req: Request<{}, {}, { id: string }>, res: Response) => {
    const { id } = req.body;
    const response = await getDocumentsApi(id);
    return res.send(response);
};
