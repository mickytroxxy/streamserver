import { collection, doc, getDocs, query, setDoc, updateDoc, where, QuerySnapshot, DocumentData } from 'firebase/firestore/lite';
import { db } from '../config/firebase';

interface Data {
    [key: string]: any;
}

interface DocumentDataWithId extends DocumentData {
    documentId: string;
}

interface UserData {
    id: string;
    [key: string]: any;
}

const createData = async (tableName: string, docId: string, data: Data): Promise<boolean> => {
    try {
        await setDoc(doc(db, tableName, docId), data);
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};

const updateData = async (tableName: string, docId: string, obj: Partial<Data>): Promise<boolean> => {
    try {
        const docRef = doc(db, tableName, docId);
        await updateDoc(docRef, obj);
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};

const getDocumentById = async (documentId: string): Promise<DocumentDataWithId[]> => {
    try {
        const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(query(collection(db, 'documents'), where('documentId', '==', documentId)));
        return querySnapshot.docs.map((doc) => doc.data() as DocumentDataWithId);
    } catch (e) {
        console.error(e);
        return [];
    }
};

const getDocumentByUserId = async (documentOwner: string): Promise<DocumentDataWithId[]> => {
    try {
        const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(
            query(collection(db, 'documents'), where('documentOwner', '==', documentOwner))
        );
        return querySnapshot.docs.map((doc) => doc.data() as DocumentDataWithId);
    } catch (e) {
        console.error(e);
        return [];
    }
};

const getUserInfo = async (id: string): Promise<UserData[]> => {
    try {
        const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(query(collection(db, 'clients'), where('id', '==', id)));
        return querySnapshot.docs.map((doc) => doc.data() as UserData);
    } catch (e) {
        console.error(e);
        return [];
    }
};
const loginApi = async (phoneNumber: string, password: string): Promise<any[]> => {
    try {
        const querySnapshot = await getDocs(
            query(collection(db, 'clients'), where('phoneNumber', '==', phoneNumber), where('password', '==', password))
        );
        const data = querySnapshot.docs.map((doc) => doc.data());
        return data;
    } catch (e) {
        console.log(e);
        return [];
    }
};
const getDocumentsApi = async (documentOwner: string): Promise<any[]> => {
    try {
        const querySnapshot = await getDocs(query(collection(db, 'documents'), where('documentOwner', '==', documentOwner)));
        const data = querySnapshot.docs.map((doc) => doc.data());
        return data;
    } catch (e) {
        return [];
    }
};
export { createData, getDocumentsApi, loginApi, updateData, getDocumentById, getDocumentByUserId, getUserInfo };
