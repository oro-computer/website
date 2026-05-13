# `std::crypto`

`std::crypto` provides cryptography primitives (hosted baseline via libsodium
in the current design).

Canonical doc: [crypto](?p=std/crypto).

## Notes

- Supported forms + design: core libsodium-backed primitives are implemented on the hosted baseline.
- Details: [crypto](?p=std/crypto)

## Importing

```silk
import arrays from "std/arrays";
import crypto from "std/crypto";
import hash from "std/crypto/hash";
import buffer from "std/buffer";
import mem from "std/runtime/mem";
```

## Examples

### Example: init + memzero + blake2b
```silk
import crypto from "std/crypto";
import hash from "std/crypto/hash";
import buffer from "std/buffer";
import mem from "std/runtime/mem";

fn main () -> int {
  if crypto::init() != None {
    return 1;
  }

  // memzero: wipe a buffer in place.
  match (buffer::BufferU8.init(16)) {
    Ok(buffer) => {
      let mut wipe: buffer::BufferU8 = buffer;

      var i: i64 = 0;
      while i < 16 {
        wipe.push(mem::trunc_u8(100 + (i as int)));
        i = i + 1;
      }

      let wipe_err: crypto::CryptoFailed? = crypto::memzero(wipe.as_bytes());
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
    },
    Err(_) => {
      return 2;
    },
  }

  // blake2b("abc") with digest_size=32.
  let msg: string = "abc";
  let msg_ptr: u64 = msg as raw u64;
  let msg_len: i64 = (sizeof(msg)) as i64;

  match (buffer::BufferU8.init(32)) {
    Ok(out_buffer) => {
      let mut out: buffer::BufferU8 = out_buffer;
      match (buffer::BufferU8.init(32)) {
        Ok(expected_buffer) => {
          let mut expected: buffer::BufferU8 = expected_buffer;

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

          let hash_err: crypto::CryptoError? = hash::blake2b(
            mut out,
            32,
            arrays::ByteSlice{ ptr: msg_ptr, len: msg_len }
          );
          if hash_err != None {
            out.drop();
            expected.drop();
            return 6;
          }
          let eq_r: crypto::CryptoBoolResult = crypto::equal(out.as_bytes(), expected.as_bytes());
          let eq_opt: bool? = crypto::CryptoBoolResult.ok_value(eq_r);
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
        },
        Err(_) => {
          out.drop();
          return 2;
        },
      }
    },
    Err(_) => {
      return 2;
    },
  }
}
```

## See also

- Canonical doc: [crypto](?p=std/crypto)
- End-to-end fixtures:
 - `tests/silk/pass_std_crypto_libsodium_basic.slk`
 - `tests/silk/pass_std_crypto_aead_basic.slk`
