# `std::crypto`

`std::crypto` provides cryptography primitives (hosted baseline via libsodium
in the current design).

Canonical doc: `docs/std/crypto.md`.

## Status

- Implemented subset + design: core libsodium-backed primitives are implemented on the hosted baseline.
- Details: `docs/std/crypto.md`

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
    wipe.push(std::runtime::mem::trunc_u8(100 + (i as int)));
    i = i + 1;
  }

  let wipe_err: std::crypto::CryptoFailed? = std::crypto::memzero(wipe.as_bytes());
  if wipe_err != None {
    wipe.drop();
    return 3;
  }

  var j: i64 = 0;
  while j < 16 {
    if wipe.get(j) != 0 {
      wipe.drop();
      return 4;
    }
    j = j + 1;
  }
  wipe.drop();

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
  expected.push(189);
  expected.push(221);
  expected.push(129);
  expected.push(60);
  expected.push(99);
  expected.push(66);
  expected.push(57);
  expected.push(114);
  expected.push(49);
  expected.push(113);
  expected.push(239);
  expected.push(63);
  expected.push(238);
  expected.push(152);
  expected.push(87);
  expected.push(155);
  expected.push(148);
  expected.push(150);
  expected.push(78);
  expected.push(59);
  expected.push(177);
  expected.push(203);
  expected.push(62);
  expected.push(66);
  expected.push(114);
  expected.push(98);
  expected.push(200);
  expected.push(192);
  expected.push(104);
  expected.push(213);
  expected.push(35);
  expected.push(25);

  let hash_err: std::crypto::CryptoError? = std::crypto::hash::blake2b(
    mut out,
    32,
    std::arrays::ByteSlice{ ptr: msg_ptr, len: msg_len }
  );
  if hash_err != None {
    out.drop();
    expected.drop();
    return 6;
  }
  let eq_r: std::crypto::CryptoBoolResult = std::crypto::equal(out.as_bytes(), expected.as_bytes());
  let eq_opt: bool? = std::crypto::CryptoBoolResult.ok_value(eq_r);
  if eq_opt == None {
    out.drop();
    expected.drop();
    return 7;
  }
  if !(eq_opt ?? false) {
    out.drop();
    expected.drop();
    return 7;
  }

  out.drop();
  expected.drop();
  return 0;
}
```

## See also

- Canonical doc: `docs/std/crypto.md`
- End-to-end fixtures:
  - `tests/silk/pass_std_crypto_libsodium_basic.slk`
  - `tests/silk/pass_std_crypto_aead_basic.slk`
