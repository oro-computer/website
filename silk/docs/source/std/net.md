# `std::net`

This is the canonical module doc for `std::net`.

`std::net` provides the hosted networking API shipped in `std/net.slk`:
byte-order helpers, IPv4/IPv6 address types, TCP and UDP sockets, hostname
resolution, and the current async socket integration layer.

The detailed API contract and platform/runtime notes are documented in:

- [networking](?p=std/networking)

Read that page as the complete public surface for:

- byte-order helpers such as `htons`, `ntohs`, `htonl`, `ntohl`
- `Ipv4Addr` and `Ipv6Addr`
- `SocketAddrV4`, `SocketAddrV6`, and `SocketAddr`
- `NetErrorKind`, `NetFailed`, and the `Net*Result` aliases
- `ResolveIpMode` and `resolve_host(...)`
- `TCPStream`, `TCPListener`, `UDPv4Socket`, and `UDPv6Socket`
- current async `connect` / `accept` support

Related docs:

- [networking](?p=std/networking)
- [io](?p=std/io)
- [http](?p=std/http)
- [https](?p=std/https)
- [websocket](?p=std/websocket)
