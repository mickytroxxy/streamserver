import { Request, Response } from 'express';
import { VerifyUserTypes } from '../dtos/types';
import { requests, sendPushNotification } from '../helpers';
import { createData, getDocumentById, getUserInfo } from '../helpers/api';

export const requestDocs = async (req: Request<{}, {}, VerifyUserTypes>, res: Response): Promise<void> => {
    const time = Date.now();
    const { companyId, companyName, documentId, isGetDocuments, requestedDocuments, timeout: tm } = req.body;
    const timeout = parseFloat(tm);

    const status = 'PENDING';
    let text = `${companyName} would like to access your personal data. Please approve with your face if you have authorized this act.`;
    if (isGetDocuments) {
        text = `${companyName} would like to have access to your ${requestedDocuments.join(
            ', '
        )} documents.\n\nTo authorize this access, please press on the APPROVE button.`;
    }
    const requestId = (time + Math.floor(Math.random() * 89999 + 10000000)).toString();

    if (timeout < 210001) {
        try {
            const documentResponse = await getDocumentById(documentId);
            if (documentResponse.length > 0) {
                const accountId = documentResponse[0].documentOwner;
                const userInfoResponse = await getUserInfo(accountId);

                if (userInfoResponse.length > 0) {
                    const user = userInfoResponse[0];
                    if (user.detectorMode) {
                        requests.push({ requestId, res, isGetDocuments, requestedDocuments, accountId });
                        await sendPushNotification(user.notificationToken, `${companyName} would like you to verify your identity`);
                        await createData('verificationRequests', requestId, {
                            time,
                            companyId,
                            accountId,
                            text,
                            status,
                            documentId,
                            requestId,
                            isGetDocuments
                        });

                        setTimeout(() => {
                            const requestInfo = requests.find((item) => item.requestId === requestId);
                            if (requestInfo) {
                                res.send({ success: 0, message: 'REQUEST TIME OUT' });
                            }
                        }, timeout);
                    } else {
                        res.send({ success: 0, message: 'USER HAS DISABLED CYBER DETECTOR MODE' });
                    }
                } else {
                    res.send({ success: 0, message: 'NO SUCH USER ON OUR SERVERS' });
                }
            } else {
                res.send({ success: 0, message: 'NO SUCH ID ON OUR SERVERS' });
            }
        } catch (error) {
            console.error('Error processing request:', error);
            res.status(500).send({ success: 0, message: 'INTERNAL SERVER ERROR' });
        }
    } else {
        res.send({ success: 0, message: 'TIMEOUT SHOULD BE LESS THAN 3 MINUTES AND 31 SECONDS' });
    }
};
