import s3 from "./awsS3"

export default async function uploadToS3(filePath: string, image: any): Promise<string> {
    try {
        const response = await s3
            .putObject({
                Bucket: process.env.S3_BUCKET_NAME ?? "",
                Key: filePath,
                Body: image,
            })
            .promise()

        return filePath
    } catch (err: any) {
        console.log(err)
        throw err
    }
}
