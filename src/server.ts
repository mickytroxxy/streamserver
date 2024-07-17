import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import './config/logging';
import { corsHandler } from './middleware/corsHandler';
import { routeNotFound } from './middleware/routeNotFound';
import { server } from './config/config';
import upload from 'express-fileupload';
import routes from './routes';
import { detectFaces } from './helpers';
export const app = express();
export let httpServer: ReturnType<typeof http.createServer>;

export const Main = () => {
    app.use(express.urlencoded({ extended: true }));
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(express.static('files'));
    app.use('files', require('express').static(__dirname + 'files'));
    app.use(express.json());
    app.use('/api', routes);
    app.use(corsHandler);
    app.use(upload);
    app.use(routeNotFound);
    httpServer = http.createServer(app);
    httpServer.listen(server.SERVER_PORT, () => {
        logging.log(`Server started on ${server.SERVER_HOSTNAME}:${server.SERVER_PORT}`);
        //detectFaces('1');
    });
};

export const Shutdown = (callback: any) => httpServer && httpServer.close(callback);

Main();
