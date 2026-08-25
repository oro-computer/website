# `std::crypto::hash`

Source: `std/crypto/hash.slk`

This is the exact canonical documentation page for `std::crypto::hash`.

## Role

`std::crypto::hash` is a shipped nested module in the Silk standard library.
It provides byte-oriented BLAKE2b and SHA-256 hashing through the bundled
libsodium implementation.

## Exported API
```silk
export fn blake2b (
  mut out: &std::buffer::BufferU8,
  out_len: i64,
  msg: std::arrays::ByteSlice,
) -> std::crypto::CryptoError?;

export fn blake2b_keyed (
  mut out: &std::buffer::BufferU8,
  out_len: i64,
  msg: std::arrays::ByteSlice,
  key: std::arrays::ByteSlice,
) -> std::crypto::CryptoError?;

export fn sha256 (
  mut out: &std::buffer::BufferU8,
  msg: std::arrays::ByteSlice,
) -> std::crypto::CryptoError?;
```

All three functions initialize the crypto runtime, validate nonnegative slice
lengths and non-null pointers for nonempty slices, grow `out` when necessary,
and return `None` on success. Allocation, initialization, or input errors are
returned as `Some(CryptoError)`.

- `blake2b` computes an unkeyed BLAKE2b digest of `out_len` bytes.
- `blake2b_keyed` computes a keyed BLAKE2b digest of `out_len` bytes.
- `sha256` computes the standard fixed 32-byte SHA-256 digest.

On success, each operation replaces the logical contents of `out` and sets its
length to the digest length. Input-validation or crypto-initialization failure
leaves `out` unchanged. Once hashing begins, a later allocation or crypto-call
failure leaves `out.len` at zero. In every case, the buffer allocation remains
owned by `out` and can be reused or dropped normally.

## Example

```silk
import arrays from "std/arrays";
import buffer from "std/buffer";
import hash from "std/crypto/hash";

fn digest_abc () -> buffer::BufferU8? {
  let mut out = buffer::BufferU8.empty();
  let msg: string = "abc";
  let err = hash::sha256(mut out, arrays::ByteSlice{
    ptr: msg as raw u64,
    len: (sizeof(msg)) as i64,
  });
  if err != None {
    out.drop();
    return None;
  }
  return Some(out);
}
```

The caller owns the output buffer and must eventually drop it or transfer that
ownership to another value.

## See Also

- [crypto](?p=std/crypto)
- [buffer](?p=std/buffer)
- [arrays](?p=std/arrays)
