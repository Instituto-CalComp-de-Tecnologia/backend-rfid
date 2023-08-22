import express, { Request, Response } from 'express';
import socket from 'socket.io';
import http from 'http';
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from 'dotenv';
import path from 'path';
import apiRouts from './routes/api';
import reload from './controllers/apiController';

dotenv.config();

const server = express();

const WEBSOCKET_CORS = {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
}

const httpServer = http.createServer(server);

const io = (socket as any)(httpServer, WEBSOCKET_CORS, {
    path: '/socket.io'
});

io.on('connection', () => {
    reload();
});

server.use(express.static(path.join(__dirname, '../public')));
server.use(cors());
server.use(bodyParser.json({limit: '50mb'}));
server.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

server.use('/api', apiRouts);

server.use((req: Request, res: Response) => {
    res.status(404);
    res.json({
        error: 'Url invalida.'
    });
});

httpServer.listen(process.env.PORT, () => {
    console.log(`Server start ${process.env.PORT}`);
});

export default io;