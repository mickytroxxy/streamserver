import { Request, Response } from 'express';
import fs from 'fs';
import { RequestInfo, UploadPDFBodyTypes } from '../dtos/types';
import { recognizeFaces, requests, responseToClient } from '../helpers';
import { mkdirp } from 'mkdirp';
import { UploadedFile } from 'express-fileupload';
import { getDocumentByUserId, updateData } from '../helpers/api';

export const verifyRequest = async (req: Request<{}, {}, UploadPDFBodyTypes>, res: Response): Promise<void> => {
    try {
        if (req.files && req.files.fileUrl) {
            const fileUrl = req.files.fileUrl as UploadedFile;
            const { requestId = '', documentId = '' } = req.body;
            const selfiePhoto = documentId + '_selfiePhoto';
            const filePath = `./files/${selfiePhoto}.png`;
            const idPath = `./files/${documentId}.png`;

            if (fs.existsSync(idPath)) {
                mkdirp.sync('./files');

                fileUrl.mv(filePath, async (err: any) => {
                    if (err) {
                        res.status(500).send({ status: 0, message: 'Failed to upload your file' });
                    } else {
                        try {
                            const similarity = await recognizeFaces(selfiePhoto);
                            if (similarity) {
                                const requestInfo: RequestInfo[] = requests.filter((item) => item.requestId === requestId);

                                if (requestInfo.length > 0 && requestInfo[0].isGetDocuments) {
                                    const requestedDocuments = requestInfo[0].requestedDocuments;
                                    const accountId = requestInfo[0].accountId;
                                    const response = await getDocumentByUserId(accountId);

                                    if (response.length > 0) {
                                        const filteredDocuments = response.filter((document) => requestedDocuments.includes(document.documentType));
                                        responseToClient(requestId, {
                                            status: 1,
                                            message: 'SUCCESS',
                                            requestedDocuments: [
                                                ...filteredDocuments,
                                                { documentType: 'selfiePhoto', url: '/' + selfiePhoto + '.png' }
                                            ]
                                        });
                                    } else {
                                        responseToClient(requestId, {
                                            status: 1,
                                            message: 'SUCCESS',
                                            requestedDocuments: [{ documentType: 'selfiePhoto', url: '/' + selfiePhoto + '.png' }]
                                        });
                                    }
                                } else {
                                    responseToClient(requestId, {
                                        status: 1,
                                        message: 'SUCCESS',
                                        requestedDocuments: [{ documentType: 'selfiePhoto', url: '/' + selfiePhoto + '.png' }]
                                    });
                                }

                                res.send({
                                    status: 1,
                                    similarity: similarity,
                                    message: 'Your verification was successful and access to your document has been granted'
                                });
                                await updateData('verificationRequests', requestId, { status: 'SUCCESS' });
                            } else {
                                responseToClient(requestId, { status: 0, message: 'NOTAMATCH' });
                                res.send({ status: 0, message: 'Identity check failed! Something Went Wrong' });
                                await updateData('verificationRequests', requestId, { status: 'NOTAMATCH' });
                            }
                        } catch (error) {
                            res.status(500).send({ status: 0, message: 'Error during face recognition' });
                        }
                    }
                });
            } else {
                res.send({ status: 0, message: 'Please sign your ID first to proceed!' });
                responseToClient(requestId, { status: 0, message: 'USER DID NOT SIGN THEIR ID' });
            }
        } else {
            res.status(400).send({ status: 0, message: 'No files were uploaded' });
        }
    } catch (error) {
        res.status(500).send({ status: 0, message: 'Failed to upload your file' });
    }
};
