import QRCode from 'qrcode';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
//@ts-ignore
import Rekognition from 'node-rekognition';
import { RequestInfo, WaterMarkOptions } from '../dtos/types';
import { Response } from 'express';
import { Expo } from 'expo-server-sdk';
let expo = new Expo();
const AWSParameters = {
    accessKeyId: '',
    secretAccessKey: '',
    region: ''
};
const rekognition = new Rekognition(AWSParameters);
export const requests: RequestInfo[] = [];

export const responseToClient = (requestId: string, obj: any): void => {
    if (requests.length > 0) {
        const requestInfo = requests.filter((item: RequestInfo) => item.requestId === requestId);
        if (requestInfo.length > 0) {
            requestInfo[0].res.send(obj);
            requests.splice(requests.indexOf(requestInfo[0]), 1);
        } else {
            console.log(requestInfo);
        }
    } else {
        console.log('Requests array is empty');
    }
};
export const detectFaces = async (documentId: string): Promise<boolean> => {
    try {
        const bitmap = fs.readFileSync(`./files/${documentId}.png`);
        const imageFaces = await rekognition.detectFaces(bitmap);
        //console.log(imageFaces);
        return imageFaces?.FaceDetails?.length > 0 || false;
    } catch (error) {
        console.error('Error detecting faces:', error);
        return false;
    }
};

export const recognizeFaces = async (documentId: string): Promise<number | null> => {
    try {
        const selfiePhoto = fs.readFileSync(`./files/${documentId}.png`);
        const documentPhoto = fs.readFileSync(`./files/${documentId.split('_')[0]}.png`);
        const imageFaces = await rekognition.compareFaces(selfiePhoto, documentPhoto);

        if (imageFaces && imageFaces.FaceMatches?.length > 0) {
            const similarity = imageFaces.FaceMatches[0]?.Similarity;
            return similarity > 74 ? similarity : null;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error recognizing faces:', error);
        return null;
    }
};
export const addWaterMark = async (documentId: string, res: Response): Promise<void> => {
    const opts: WaterMarkOptions = {
        errorCorrectionLevel: 'H',
        quality: 1,
        margin: 2,
        width: 50,
        color: {
            dark: '#000',
            light: '#fff'
        }
    };
    try {
        const url = await QRCode.toDataURL(documentId, opts);
        const pdfBytes = fs.readFileSync(`./files/${documentId}.pdf`);
        const doc = await PDFDocument.load(pdfBytes);
        const pages = doc.getPages();
        const img = await doc.embedPng(url);

        for (const page of pages) {
            page.drawImage(img, {
                x: page.getWidth() - 60,
                y: 10
            });
        }

        const pdfBytesWithWatermark = await doc.save();
        fs.writeFileSync(`./files/${documentId}.pdf`, pdfBytesWithWatermark);
        res.send(true);
    } catch (error) {
        console.error('Error adding watermark:', error);
        res.status(500).send({ message: 'Failed to add watermark' });
    }
};

export const sendPushNotification = async (to: string, body: string) => {
    const messages: any = [
        {
            to,
            sound: 'default',
            body,
            data: {}
        }
    ];
    let chunks = expo.chunkPushNotifications(messages);
    for (let chunk of chunks) {
        try {
            let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            console.log(ticketChunk);
        } catch (error) {
            console.error(error);
        }
    }
};
