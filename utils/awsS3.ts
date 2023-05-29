import AWS from "aws-sdk"

const s3 = new AWS.S3({
    apiVersion: "2012-10-17",
    region: process.env.S3_REGION ?? "",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY ?? "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
    },
})

export default s3
