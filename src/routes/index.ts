import { Router } from 'express';
import { getApiStatus } from '../handlers/status';
import { login, register, streamRegister } from '../handlers/auth';
import { authorize } from '../middleware/authentication';
import { uploadPDF } from '../handlers/uploadPDF';
import { verifyRequest } from '../handlers/verifyRequest';
import { denyRequest } from '../handlers/denyRequest';
import { requestDocs } from '../handlers/requestDocs';
import { signPDF } from '../handlers/signPDF';
import { sendEmail } from '../handlers/sendEmail';
import { getDocuments } from '../handlers/documents';

const router = Router();

router.get('/status', getApiStatus);
router.post('/login', login);
router.post('/register', register);
router.post('/streamRegister', streamRegister);
router.post('/uploadPDF', authorize, uploadPDF);
router.post('/verifyRequest', authorize, verifyRequest);
router.post('/getDocuments', authorize, getDocuments);
router.post('/verifyUser', authorize, requestDocs);
router.post('/sendEmail', authorize, sendEmail);
router.get('/denyRequest/:requestId', authorize, denyRequest);
router.get('/signPDF/:documentId', authorize, signPDF);

export default router;
