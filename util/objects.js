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

// convert object to string
function serialise(obj) {
  // note that `JSON.stringify` is not "safe" to use because key order is not part of the specification,
  // and thus is implementation specific on the Javascript runtime.
  // Instead, need to use a 3rd-party library to ensure this.
  // Not doing so will result in potentially different hashes for the same object,
  // and that will break any validation based on hashes.
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
