import { Request, Response } from 'express';
import { updateData } from '../helpers/api';
import { responseToClient } from '../helpers';

export const denyRequest = async (req: Request, res: Response): Promise<void> => {
    const requestId = req.params.requestId;
    updateData('verificationRequests', requestId, { status: 'DENIED' });
    responseToClient(requestId, { status: 0, message: 'USER HAS DENIED YOUR REQUEST' });
    res.send(true);
};
