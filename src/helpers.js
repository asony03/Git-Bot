const crypto = require('crypto');

exports.rawBodySaver = (req, res, buf) => {
  if (buf && buf.length) {
    req.rawBody = buf;
  }
};

exports.verifySignature = (req) => {
  const hmac = crypto.createHmac('sha1', process.env.GITHUB_WEBHOOK_SECRET);
  hmac.update(req.rawBody, 'utf-8');
  return req.headers['x-hub-signature'] === `sha1=${hmac.digest('hex')}`;
};
