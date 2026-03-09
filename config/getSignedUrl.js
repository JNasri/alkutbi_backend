const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const s3 = require("./s3");

const EXPIRES_IN = 4 * 60 * 60; // 4 hours

/**
 * Generates a pre-signed S3 URL for a private file.
 * Accepts either a raw S3 key ("W-260308001.pdf") or a full S3 URL
 * (backward compatible with existing records stored as full URLs).
 *
 * @param {string} bucket - S3 bucket name
 * @param {string} keyOrUrl - S3 key or full S3 URL
 * @returns {Promise<string|null>}
 */
const getS3SignedUrl = async (bucket, keyOrUrl) => {
  if (!keyOrUrl) return null;

  let key = keyOrUrl;

  // If it's a full URL, extract just the key from the path
  if (keyOrUrl.startsWith("http")) {
    try {
      const url = new URL(keyOrUrl);
      key = decodeURIComponent(url.pathname.replace(/^\//, "").split("?")[0]);
    } catch {
      return keyOrUrl; // fallback: return as-is if parsing fails
    }
  }

  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(s3, command, { expiresIn: EXPIRES_IN });
};

module.exports = { getS3SignedUrl };
