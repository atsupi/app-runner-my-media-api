import * as dotenv from 'dotenv';
import fs from 'fs'
import path from 'path';
import AWS from 'aws-sdk';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

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

export async function s3FileDownload(key, localfile) {
    console.log("s3FileDownload", key, path.join(__dirname, localfile));
    console.log(process.env.S3_BUCKET_NAME);
    try {
        const uploaded_data = await s3.getObject({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key
        }).promise()
            .catch((err) => console.log(err));
        fs.writeFileSync(
            path.join(__dirname, localfile),
            uploaded_data.Body
        );
    } catch (err) {
        console.log(err);
    }
}

export async function s3FileUpload(key, localfile) {
    try {
        await s3.putObject({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
            Body: fs.createReadStream(path.join(__dirname, localfile)),
            ContentType: "video/mp4"
        }).promise()
            .catch((err) => console.log(err));
    } catch (err) {
        console.log(err);
    }
}

export function invokeFFmpegCommand(inFile, outFile) {
    try {
        const pathIn = path.join(__dirname, inFile);
        const pathOut = path.join(__dirname, outFile);
        const command = 'ffmpeg -i ' + pathIn + ' -vf scale=-1:540 ' + pathOut + ' -y';
        execSync(command);
    } catch (err) {
        console.log(err);
    }
}
