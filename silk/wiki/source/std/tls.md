# `std::tls`

`std::tls` provides TLS client/server primitives (hosted baseline via mbedTLS).

Canonical doc: `docs/std/tls.md`.

## Status

- Implemented subset + design: `Session` + `MemPipe` are implemented for hosted targets.
- Details: `docs/std/tls.md` and `STATUS.md`

## Importing

```silk
import std::tls;
```

## Examples

### Works today: in-memory client/server handshake (MemPipe)

This example uses `MemPipe` so it does not require sockets. It is kept runnable
as `tests/silk/pass_std_tls_mem_handshake.slk`.

```silk
import mem from "std/runtime/mem.slk";
import std::arrays;
import std::tls;

fn test_cert () -> string {
  return `-----BEGIN CERTIFICATE-----
MIIDCTCCAfGgAwIBAgIUZGlB8Eq9CXntm2xyJOT1X1eNCjMwDQYJKoZIhvcNAQEL
BQAwFDESMBAGA1UEAwwJbG9jYWxob3N0MB4XDTI2MDEwMzAyMDUyM1oXDTM2MDEw
MTAyMDUyM1owFDESMBAGA1UEAwwJbG9jYWxob3N0MIIBIjANBgkqhkiG9w0BAQEF
AAOCAQ8AMIIBCgKCAQEA0RvQxOWGAe2a4qh9/lUFpIeEOdQFKrGf569AwPwAbcLo
/Ah9/wBSXzXL/jCy8ofemWS7HmP94Ikm11zJxjOeufXCbGS+X+M2OrhRYJDx5CCv
FwjZsSpNjTkW/weDr9ysVgTdsuOEVnnHnTVXiO2urKSVwPgkDS9xJjorx8tsBQLk
R/w2GgmNQ+7tp7BD8HmXFSKw+ysCyK4p3s4+UZj8y2ieoEB/wJtEGKh6boYNR4o3
c2tb/pSV0ADB1BijLgiIa/UTejC3vyYNzi9j0vt4lntjsLcBWASdGT++0EX1IBR9
KQtoTvRrdp7Yima383+0Wp7WYa3XLMcpZuZPmD5OyQIDAQABo1MwUTAdBgNVHQ4E
FgQUNBuK6PDKUMNJUvuJzAdki6AztyIwHwYDVR0jBBgwFoAUNBuK6PDKUMNJUvuJ
zAdki6AztyIwDwYDVR0TAQH/BAUwAwEB/zANBgkqhkiG9w0BAQsFAAOCAQEAqcHO
Cfik6/WU/VysILwfO+27xAryD/xcTTT5WWIAKAH7d7Hmg9OyyLe7AZ0hog2rhLzW
+LYzQK8glzKoblXe+h8Mukel84DMzCJHdJAfdNKftf1gg+pxUP7Bg6MyJqBXo6gd
UN2jRsbYhxNPlIECJk/vYuDgi9i+k43+At/CHClZjx9dOmx4Nv8kK9r6aOlI6Vms
y4hZQtsSHGmUJs8T57aW3TKW0mFs/jUAISkeLBoBO84tu7Gzu+QeFGYAgHWR8wp2
4H5eSv3/R0eBaHUM9riHaS6wF+9cF+vZFzRgWHaCHpVghIpQhpQTD+RdO8mdVmi5
4qqkcIeXp+6Zggtv9w==
-----END CERTIFICATE-----
`;
}

fn test_key () -> string {
  return `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDRG9DE5YYB7Zri
qH3+VQWkh4Q51AUqsZ/nr0DA/ABtwuj8CH3/AFJfNcv+MLLyh96ZZLseY/3giSbX
XMnGM5659cJsZL5f4zY6uFFgkPHkIK8XCNmxKk2NORb/B4Ov3KxWBN2y44RWeced
NVeI7a6spJXA+CQNL3EmOivHy2wFAuRH/DYaCY1D7u2nsEPweZcVIrD7KwLIrine
zj5RmPzLaJ6gQH/Am0QYqHpuhg1Hijdza1v+lJXQAMHUGKMuCIhr9RN6MLe/Jg3O
L2PS+3iWe2OwtwFYBJ0ZP77QRfUgFH0pC2hO9Gt2ntiKZrfzf7RantZhrdcsxylm
5k+YPk7JAgMBAAECggEABBHaBNMAwi3ZK1sjJJ2MABFBIgz90sBlP9GZ3YeqDHjU
Jv+VUC6167N01mwlN3Isg2jB+Yvxp3qT3nIoXSqpBq6BS7HEQMJ/zjHDJ7F6e7ml
Hrol3nxXyQ1Y5LrFNdmCIyRyGiaybypsl6MvonMZyLNlVL2fmgAX4CoWqwtK/Wfx
dwssGbrlr3QvGM6aTBEDDY/xCwSvkZ5l0ImGq1Fuk61rkwnFysRNlzuOwcbAjDoM
Qd+fjRKWfCltnHJdc1BxnyTTuzuc9rR7ZCEaoe4xgG9A1YIrXdA89CPHP3hC9nmr
uTxjJ/fT5xir0p4FBjeImDiyhfMFrARTGexVLx8MpwKBgQDVDXotnEkYPFFyMvWD
nxtT+9pesJpnqF0LGFm1Un9Fgjg7so41P5nJVsO/vSKXDAOG1UT5wAmDVtGSmAre
Zaopy/OWm5QsFUzTet5sALF0j8whIiy2epVGd1Om4ndmWUOrKapq5ZwfR5UW4tei
6xI57YdA9v/N+6Im7DwVAQ4IRwKBgQD7Qs9GoROQ9S0tYh/JHWx8/MiNGycEb4CA
B7dt1QhGkVff+fhfEX6l5uTU6xbtjmX6ZJJHNcjgv6Y/ngC+UvohSrdaIq6R0k03
ZJPzf9WFDdvc8n2sT52MJSMb/lz4zU/TuOiwROuKhJ/M1g3MoY3uFOx7smxHzeV2
b/DBX6WIbwKBgGk4mcHS8OquR48+CbEysD1/Ii8ny2osZZ9oLE3363F5yan6Gm/D
9IDSgCS/FUlCHq/FvqYWKNyb0S80NhH2Zd70ol4cgkZvUp0TjqwKf5nQtwEaLrkE
u5qsrjy6ljuPFHOBRXA77CoqoUBHUjZdIIhJfkYgdt/VShUtENNSzQpbAoGAJY9+
Ntu7dg8AuukRQVpRrnmHbXiio4oblogQxq1y+EGf9k6C74tI+HoEuUOPgOGpov3H
1DdZGSftLVNsXwc+dx2ZPTM0D351ppM1ftAcVjCVLnldihW4wouGrRegRF1E0qyw
tDEJWQKsdM2G8JEyC2Y7V957S1yfMc5YGkA3GacCgYEAuTfYz3IY6lIWGd0eDijU
ElDm/6m2Eb8JcH9F+fayYJ5ebQQgsrvNQXpFI4y0Z01X/l/OtYYgUeO1vDKWVzOp
6Jq1125v1+I7+Fce5KVj56oWiirFHqGXqGJK104sGOSTCjXy7pyZGoVCpplqWabN
GSDCV/JoUBg4iPwQ0rK0Tlo=
-----END PRIVATE KEY-----
`;
}

fn drive_handshake (mut client: &Session, mut server: &Session) -> bool {
  var client_done: bool = false;
  var server_done: bool = false;

  var steps: int = 0;
  while steps < 100000 {
    steps += 1;

    if !client_done {
      let rc = client.handshake_step();
      if rc == 0 {
        client_done = true;
      } else {
        if rc != ERR_WANT_READ && rc != ERR_WANT_WRITE {
          return false;
        }
      }
    }

    if !server_done {
      let rc = server.handshake_step();
      if rc == 0 {
        server_done = true;
      } else {
        if rc != ERR_WANT_READ && rc != ERR_WANT_WRITE {
          return false;
        }
      }
    }

    if client_done && server_done {
      return true;
    }
  }

  return false;
}

fn read_some (mut sess: &Session, ptr: u64, cap: u64) -> i32 {
  var tries: int = 0;
  while tries < 100000 {
    tries += 1;
    let rc = sess.read(std::arrays::ByteSlice{ ptr: ptr, len: cap as i64 });
    if rc > 0 {
      return rc;
    }
    if rc == ERR_WANT_READ || rc == ERR_WANT_WRITE {
      continue;
    }
    return rc;
  }
  return -1 as i32;
}

fn main () -> int {
  var pipe = MemPipe.init(65536);
  if !pipe.is_valid() {
    return 1;
  }

  var client: Session = Session.client() ?? Session.invalid();
  if !client.is_valid() {
    (mut pipe).drop();
    return 2;
  }

  var server: Session = Session.server(test_cert(), test_key()) ?? Session.invalid();
  if !server.is_valid() {
    (mut client).drop();
    (mut pipe).drop();
    return 3;
  }

  client.set_bio_mempipe(pipe.client_ctx());
  server.set_bio_mempipe(pipe.server_ctx());

  if !drive_handshake(mut client, mut server) {
    (mut server).drop();
    (mut client).drop();
    (mut pipe).drop();
    return 4;
  }

  if !client.write_string("ping") {
    (mut server).drop();
    (mut client).drop();
    (mut pipe).drop();
    return 5;
  }

  let buf_ptr = mem::alloc(64);
  if buf_ptr == 0 {
    (mut server).drop();
    (mut client).drop();
    (mut pipe).drop();
    return 6;
  }

  let n = read_some(mut server, buf_ptr, 64);
  if n <= 0 {
    mem::free(buf_ptr);
    (mut server).drop();
    (mut client).drop();
    (mut pipe).drop();
    return 7;
  }

  let got = mem::string_from_ptr_len(buf_ptr, n as int);
  if got != "ping" {
    mem::free(buf_ptr);
    (mut server).drop();
    (mut client).drop();
    (mut pipe).drop();
    return 8;
  }

  if !server.write_string("pong") {
    mem::free(buf_ptr);
    (mut server).drop();
    (mut client).drop();
    (mut pipe).drop();
    return 9;
  }

  let n2 = read_some(mut client, buf_ptr, 64);
  if n2 <= 0 {
    mem::free(buf_ptr);
    (mut server).drop();
    (mut client).drop();
    (mut pipe).drop();
    return 10;
  }

  let got2 = mem::string_from_ptr_len(buf_ptr, n2 as int);
  if got2 != "pong" {
    mem::free(buf_ptr);
    (mut server).drop();
    (mut client).drop();
    (mut pipe).drop();
    return 11;
  }

  mem::free(buf_ptr);
  (mut server).drop();
  (mut client).drop();
  (mut pipe).drop();
  return 0;
}
```

## See also

- Canonical doc: `docs/std/tls.md`
- End-to-end fixture: `tests/silk/pass_std_tls_mem_handshake.slk`
