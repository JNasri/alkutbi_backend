// config/uploadToS3.js
const { Upload } = require("@aws-sdk/lib-storage");
const s3 = require("./s3");
const { v4: uuidv4 } = require("uuid");

/**
 * Uploads a file to S3 (private) and returns the S3 key.
 * The key is stored in the DB; signed URLs are generated on read.
 */
const uploadToS3 = async (file) => {
  const key = uuidv4().replace(/-/g, "");
  const uploadParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    // No ACL — object is private by default
  };

  const uploader = new Upload({
    client: s3,
    params: uploadParams,
  });

  await uploader.done();
  return key; // return key, not a full URL
};

module.exports = { uploadToS3 };
