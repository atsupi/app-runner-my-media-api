import fs from 'fs'
import path from 'path';
import AWS from 'aws-sdk';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import {
    SecretsManagerClient,
    GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const secret_name1 = "ACCESS_KEY";
const secret_name2 = "SECRET_ACCESS_KEY";
const secret_name3 = "S3_BUCKET_NAME";

const client = new SecretsManagerClient({
    region: "ap-northeast-1",
});

let value1;
let value2;
let value3;

try {
    const response1 = await client.send(
        new GetSecretValueCommand({
            SecretId: secret_name1,
            VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
        })
    );
    value1 = JSON.parse(response1.SecretString);
    const response2 = await client.send(
        new GetSecretValueCommand({
            SecretId: secret_name2,
            VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
        })
    );
    value2 = JSON.parse(response2.SecretString);
    const response3 = await client.send(
        new GetSecretValueCommand({
            SecretId: secret_name3,
            VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
        })
    );
    value3 = JSON.parse(response3.SecretString);
} catch (error) {
    // For a list of exceptions thrown, see
    // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
    throw error;
}

const secret1 = value1["ACCESS_KEY"];
const secret2 = value2["SECRET_ACCESS_KEY"];
const secret3 = value3["S3_BUCKET_NAME"];

AWS.config.update({
    credentials: new AWS.Credentials(
        secret1, // access key
        secret2, // secret access key
    ),
    region: "ap-northeast-1"
});

const s3 = new AWS.S3();

export async function s3FileDownload(key, localfile) {
    console.log("s3FileDownload", key, path.join(__dirname, localfile));
    try {
        const uploaded_data = await s3.getObject({
            Bucket: secret3,
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
    console.log("s3FileUpload", key, path.join(__dirname, localfile));
    try {
        await s3.putObject({
            Bucket: secret3,
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

export function getAccessKey () {
    return secret1;
}

export function getSecretAccessKey () {
    return secret2;
}

export function getS3BacketName () {
    return secret3;
}
