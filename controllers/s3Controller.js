const asyncHandler = require("express-async-handler");
const { getS3SignedUrl } = require("../config/getSignedUrl");
const MAIN_BUCKET = process.env.S3_BUCKET_NAME;

// @desc Get signed URL for a specific S3 key
// @route POST /s3/sign
// @access Private
const getSignedUrl = asyncHandler(async (req, res) => {
  const { key } = req.body;
  if (!key) {
    return res.status(400).json({ message: "S3 key is required" });
  }

  try {
    const signedUrl = await getS3SignedUrl(MAIN_BUCKET, key);
    res.json({ url: signedUrl });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate signed URL" });
  }
});

module.exports = {
  getSignedUrl,
};
