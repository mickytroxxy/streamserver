import { Request, Response } from 'express';
import { LoginTypes, RegisterTypes } from '../dtos/types';
import { createToken } from '../middleware/authentication';
import { createData, loginApi } from '../helpers/api';
import { genSaltSync, hashSync } from 'bcrypt';
import { StreamChat } from 'stream-chat';
import { server } from '../config/config';
export const login = async (req: Request<{}, {}, LoginTypes>, res: Response) => {
    const { phoneNumber, password } = req.body;
    console.log(phoneNumber, password);
    const response = await loginApi(phoneNumber, password);
    if (response.length > 0) {
        const token = createToken(phoneNumber);
        const user = response?.[0];
        return res.send({ status: 200, statusMessage: 'You are logged in', data: [{ ...user, token }] });
    } else {
        return res.send({ status: 0, statusMessage: 'Invalid login details' });
    }
};
export const streamRegister = async (req: Request<{}, {}, LoginTypes>, res: Response) => {
    const { phoneNumber } = req.body;
    try {
        const serverClient = StreamChat.getInstance(server.STREAM_API as string, server.STREAM_SECRET);
        await serverClient.upsertUsers([
            {
                id: phoneNumber,
                phoneNumber
            }
        ]);
        const token = serverClient.createToken(phoneNumber);
        return res.status(200).json({ token, phoneNumber });
    } catch (error) {}
};
export const register = async (req: Request<{}, {}, RegisterTypes>, res: Response) => {
    const { tableName, documentId, obj } = req.body;
    const response = await createData(tableName, documentId, obj);
    if (response) {
        const token = createToken(obj?.phoneNumber);
        return res.send({ status: 200, statusMessage: 'Registration successfull', data: [{ ...obj, token }] });
    } else {
        return res.send({ status: 0, statusMessage: 'Something went wrong while trying to create an account!' });
    }
};
