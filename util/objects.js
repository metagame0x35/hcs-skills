const crypto = require('node:crypto');

const { configure } = require('safe-stable-stringify');

const safeStableStringify = configure({
  deterministic: true,
  strict: true,
  circularValue: Error,
  bigint: false,
  // avoid overly large values
  maximumBreadth: 10,
  maximumDepth: 2,
});

function serialise(obj) {
  return safeStableStringify(obj);
}

function deserialise(str) {
  return JSON.parse(str);
}

function addHash(obj) {
  // strip out any hash if it is present
  const { hash: originalHash, ...objSansHash } = obj;

  // compute the hash based on the rest of the object in serialised form
  const hashInput = serialise(objSansHash);
  const hash = crypto.createHash('sha256')
    .update(hashInput, 'binary')
    .digest('hex');
  return {
    ...objSansHash,
    hash,
  };
}

function removeHash(obj) {
  const { hash, ...restOfObj } = obj;
  return restOfObj;
}

module.exports = {
  serialise,
  deserialise,
  addHash,
  removeHash,
};
