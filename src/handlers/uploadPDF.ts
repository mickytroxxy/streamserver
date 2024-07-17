import { Request, Response } from 'express';
import { UploadPDFBodyTypes } from '../dtos/types';
import { detectFaces, recognizeFaces } from '../helpers';
import { mkdirp } from 'mkdirp';
import { UploadedFile } from 'express-fileupload';

export const uploadPDF = async (req: Request<{}, {}, UploadPDFBodyTypes>, res: Response) => {
    try {
        if (req.files && req.files.fileUrl) {
            const fileUrl = req.files.fileUrl as UploadedFile;
            const { documentId, fileCategory } = req.body;

            mkdirp.sync('./files');
            const filePath = fileCategory === 'document' ? `./files/${documentId}.pdf` : `./files/${documentId}.png`;

            await fileUrl.mv(filePath);

            if (fileCategory === 'document') {
                res.send({ status: 1, message: 'Document Successfully uploaded!' });
            } else if (fileCategory === 'documentPhoto') {
                const faceDetected = await detectFaces(documentId);
                if (faceDetected) {
                    res.send({ status: 1, message: 'Face detected, now comparing, please wait...' });
                } else {
                    res.send({ status: 0, message: 'No face identified, scroll to where your face is!' });
                }
            } else {
                const similarity = await recognizeFaces(documentId);
                if (similarity) {
                    res.send({ status: 1, similarity });
                } else {
                    res.send({ status: 0, message: 'Identity check failed! Something Went Wrong' });
                }
            }
        } else {
            res.status(400).send({ status: 0, message: 'No files were uploaded' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ status: 0, message: 'Failed to upload your file' });
    }
};
