
import * as dotenv from 'dotenv';
import express from 'express';
import { invokeFFmpegCommand, s3FileDownload, s3FileUpload } from './Utils.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import AWS from 'aws-sdk';
import cors from 'cors';

const app = express();
const port = 3001;
app.use(express.json());
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

AWS.config.update({
    credentials: new AWS.Credentials(
        process.env.ACCESS_KEY,
        process.env.SECRET_ACCESS_KEY
    ),
    region: "ap-northeast-1"
});

const s3 = new AWS.S3();

app.listen(port, () => {
    console.log("express: port %d opened", port);
});

// app.post("/media", (req, res) => {
//     console.log("POST: access to /media");
//     const item = {
//         param: req.body,
//     }
//     s3FileDownload(req.body.key, "tmp2.mov");
//     invokeFFmpegCommand("tmp2.mov", "tmp.mov");
//     s3FileUpload(req.body.newKey, "tmp.mov");
//     res.send(item);  
// });

app.post("/media", async (req, res) => {
    console.log("POST: access to /media");
    const item = {
        result: "201 OK",
        param: req.body,
    }
    console.log("s3FileDownload", req.body.key, path.join(__dirname, "tmp2.mov"));
    console.log(process.env.S3_BUCKET_NAME);
    try {
        const uploaded_data = await s3.getObject({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: req.body.key
        }).promise()
            .catch((err) => console.log(err));
        fs.writeFileSync(
            path.join(__dirname, "tmp2.mov"),
            uploaded_data.Body
        );
    } catch (err) {
        console.log(err);
    }
    invokeFFmpegCommand("tmp2.mov", "tmp.mov");
    s3FileUpload(req.body.newKey, "tmp.mov");
    res.status(201).json(item);  
});
