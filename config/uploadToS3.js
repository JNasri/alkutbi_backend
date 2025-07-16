// config/uploadToS3.js
const { Upload } = require("@aws-sdk/lib-storage");
const s3 = require("./s3");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const uploadToS3 = async (file) => {
  const uniqueName = uuidv4().replace(/-/g, "");
  const uploadParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: uniqueName,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: "public-read", // or "private" if you don't want public access
  };

  const uploader = new Upload({
    client: s3,
    params: uploadParams,
  });

  await uploader.done();

  return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueName}`;
};

module.exports = { uploadToS3 };
