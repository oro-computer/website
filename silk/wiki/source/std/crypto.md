# `std::crypto`

`std::crypto` provides cryptography primitives (hosted baseline via libsodium
in the current design).

Canonical doc: `docs/std/crypto.md`.

## Status

- Implemented subset + design: core libsodium-backed primitives are implemented on the hosted baseline.
- Details: `docs/std/crypto.md` and `STATUS.md`

## Importing

```silk
import std::arrays;
import std::crypto;
import std::crypto::hash;
import std::buffer;
import std::runtime::mem;
```

## Examples

### Works today: init + memzero + blake2b

```silk
import std::crypto;
import std::crypto::hash;
import std::buffer;
import std::runtime::mem;

fn main () -> int {
  if std::crypto::init() != None {
    return 1;
  }

  // memzero: wipe a buffer in place.
  let wipe_r = std::buffer::BufferU8.init(16);
  if wipe_r.is_err() { return 2; }
  let mut wipe: std::buffer::BufferU8 = match (wipe_r) {
    Ok(v) => v,
    Err(_) => std::buffer::BufferU8.empty(),
  };

  var i: i64 = 0;
  while i < 16 {
    (mut wipe).push(std::runtime::mem::trunc_u8(100 + (i as int)));
    i = i + 1;
  }

  let wipe_err: std::crypto::CryptoFailed? = std::crypto::memzero(wipe.as_bytes());
  if wipe_err != None {
    (mut wipe).drop();
    return 3;
  }

  var j: i64 = 0;
  while j < 16 {
    if wipe.get(j) != 0 {
      (mut wipe).drop();
      return 4;
    }
    j = j + 1;
  }
  (mut wipe).drop();

  // blake2b("abc") with digest_size=32.
  let msg: string = "abc";
  let msg_ptr: u64 = std::runtime::mem::string_ptr(msg);
  let msg_len: i64 = std::runtime::mem::string_len(msg);

  let out_r = std::buffer::BufferU8.init(32);
  let expected_r = std::buffer::BufferU8.init(32);
  if out_r.is_err() || expected_r.is_err() { return 2; }
  let mut out: std::buffer::BufferU8 = match (out_r) {
    Ok(v) => v,
    Err(_) => std::buffer::BufferU8.empty(),
  };
  let mut expected: std::buffer::BufferU8 = match (expected_r) {
    Ok(v) => v,
    Err(_) => std::buffer::BufferU8.empty(),
  };

  // Expected digest: bddd813c634239723171ef3fee98579b94964e3bb1cb3e427262c8c068d52319
  (mut expected).push(189);
  (mut expected).push(221);
  (mut expected).push(129);
  (mut expected).push(60);
  (mut expected).push(99);
  (mut expected).push(66);
  (mut expected).push(57);
  (mut expected).push(114);
  (mut expected).push(49);
  (mut expected).push(113);
  (mut expected).push(239);
  (mut expected).push(63);
  (mut expected).push(238);
  (mut expected).push(152);
  (mut expected).push(87);
  (mut expected).push(155);
  (mut expected).push(148);
  (mut expected).push(150);
  (mut expected).push(78);
  (mut expected).push(59);
  (mut expected).push(177);
  (mut expected).push(203);
  (mut expected).push(62);
  (mut expected).push(66);
  (mut expected).push(114);
  (mut expected).push(98);
  (mut expected).push(200);
  (mut expected).push(192);
  (mut expected).push(104);
  (mut expected).push(213);
  (mut expected).push(35);
  (mut expected).push(25);

  let hash_err: std::crypto::CryptoError? = std::crypto::hash::blake2b(
    mut out,
    32,
    std::arrays::ByteSlice{ ptr: msg_ptr, len: msg_len }
  );
  if hash_err != None {
    (mut out).drop();
    (mut expected).drop();
    return 6;
  }
  let eq_r: std::crypto::CryptoBoolResult = std::crypto::equal(out.as_bytes(), expected.as_bytes());
  let eq_opt: bool? = std::crypto::CryptoBoolResult.ok_value(eq_r);
  if eq_opt == None {
    (mut out).drop();
    (mut expected).drop();
    return 7;
  }
  if !(eq_opt ?? false) {
    (mut out).drop();
    (mut expected).drop();
    return 7;
  }

  (mut out).drop();
  (mut expected).drop();
  return 0;
}
```

## See also

- Canonical doc: `docs/std/crypto.md`
- End-to-end fixtures:
  - `tests/silk/pass_std_crypto_libsodium_basic.slk`
  - `tests/silk/pass_std_crypto_aead_basic.slk`
