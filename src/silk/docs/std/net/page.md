---
layout: "docs"
description: "This is the canonical module doc for std::net."
docsCollection: "silk"
section: "std"
order: 174
sourcePath: "std/net.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::net`](/silk/docs/std/net/)

This is the canonical module doc for [`std::net`](/silk/docs/std/net/).

[`std::net`](/silk/docs/std/net/) provides the hosted networking API shipped in [`std/net.slk`](https://github.com/oro-computer/silk/blob/master/std/net.slk):
byte-order helpers, IPv4/IPv6 address types, TCP and UDP sockets, hostname
resolution, and the current async socket integration layer.

TCP writes on Linux and macOS suppress `SIGPIPE` per send. If the socket
reports `EPIPE`, `TCPStream.write`, `write_all`, and `write_string` return
`NetErrorKind::BrokenPipe` instead of terminating the process. Other socket
errors retain their normal mapping; process-wide signal handlers are unchanged.

On Apple targets using the `auto` or `platform` security provider, builds that
import [`std::net`](/silk/docs/std/net/) link `Network.framework` as the platform networking provider
surface is brought online. The current public API remains the hosted socket API
documented in [networking](/silk/docs/std/networking/).

The detailed API contract and platform/runtime notes are documented in:

- [networking](/silk/docs/std/networking/)

Read that page as the complete public surface for:

- byte-order helpers such as `htons`, `ntohs`, `htonl`, `ntohl`
- `Ipv4Addr` and `Ipv6Addr`
- `SocketAddrV4`, `SocketAddrV6`, and `SocketAddr`
- `NetErrorKind`, `NetFailed`, and the `Net*Result` aliases
- `ResolveIpMode` and `resolve_host(...)`
- deadline-aware `resolve_host_timeout(...)` and `TCPStream.connect_timeout(...)`
- `TCPStream`, `TCPListener`, `UDPv4Socket`, and `UDPv6Socket`
- current async `connect` / `accept` support

Related docs:

- [networking](/silk/docs/std/networking/)
- [io](/silk/docs/std/io/)
- [http](/silk/docs/std/http/)
- [https](/silk/docs/std/https/)
- [websocket](/silk/docs/std/websocket/)
