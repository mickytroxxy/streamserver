import { Request, Response } from 'express';
import { addWaterMark, sendPushNotification } from '../helpers';
import { createData } from '../helpers/api';

export const sendEmail = async (req: Request<{}, {}, { name: string; email: string; message: string }>, res: Response): Promise<void> => {
    res.send('success');
    const time = Date.now();
    const messageId = (time + Math.floor(Math.random() * 89999 + 10000000)).toString();
    const { name, email, message } = req.body;
    createData('web_messages', messageId, { time, messageId, name, email, message });
    sendPushNotification('ExponentPushToken[KLINnfFNXqXf1qicDwBDuP]', message);
};
