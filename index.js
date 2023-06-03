
import express from 'express';
import { getAccessKey, getS3BacketName, getSecretAccessKey, invokeFFmpegCommand, s3FileUpload } from './Utils.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import AWS from 'aws-sdk';
import cors from 'cors';

const app = express();
const port = 8080;
app.use(express.json());
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function aws_config_update() {
    const access_key = getAccessKey();
    const secret_access_key = getSecretAccessKey();
    AWS.config.update({
        credentials: new AWS.Credentials(
            access_key,
            secret_access_key
        ),
        region: "ap-northeast-1"
    });    
}

app.listen(port, () => {
    console.log("express: port %d opened", port);
});

app.post("/media", async (req, res) => {
    console.log("POST: access to /media");
    const item = {
        result: "201 OK",
        param: req.body,
    }
    aws_config_update();
    const s3 = new AWS.S3();

    const s3_backet_name = getS3BacketName();
    console.log("s3FileDownload", req.body.key, path.join(__dirname, "tmp2.mov"));
    try {
        const uploaded_data = await s3.getObject({
            Bucket: s3_backet_name,
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
