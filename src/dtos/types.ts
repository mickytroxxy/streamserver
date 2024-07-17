import { Request, Response } from 'express';
import { UploadedFile } from 'express-fileupload';
import jwt from 'jsonwebtoken';
export interface Test {
    fname: string;
    email: string;
    password: string;
}
export type LoginTypes = {
    phoneNumber: string;
    password: string;
};
export type RegisterTypes = {
    tableName: string;
    documentId: string;
    obj: any;
};
export interface IGetUserAuthInfoRequest extends Request {
    user: any;
}

export interface UploadPDFBodyTypes {
    documentId: string;
    fileCategory: string;
    requestId?: string;
    files?: {
        fileUrl?: UploadedFile | UploadedFile[];
    };
}
export interface VerifyUserTypes {
    documentId: string;
    companyId: string;
    companyName: string;
    isGetDocuments: boolean;
    requestedDocuments: any;
    timeout: any;
}
export interface WaterMarkOptions {
    errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
    quality: number;
    margin: number;
    width: number;
    color: {
        dark: string;
        light: string;
    };
}
export interface RequestInfo {
    requestId: string;
    res: Response;
    isGetDocuments: boolean;
    requestedDocuments: string[];
    accountId: string;
}
