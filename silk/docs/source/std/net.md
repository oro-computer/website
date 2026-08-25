# `std::net`

This is the canonical module doc for `std::net`.

`std::net` provides the hosted networking API shipped in `std/net.slk`:
byte-order helpers, IPv4/IPv6 address types, TCP and UDP sockets, hostname
resolution, and the current async socket integration layer.

On Apple targets using the `auto` or `platform` security provider, builds that
import `std::net` link `Network.framework` as the platform networking provider
surface is brought online. The current public API remains the hosted socket API
documented in [networking](?p=std/networking).

The detailed API contract and platform/runtime notes are documented in:

- [networking](?p=std/networking)

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

- [networking](?p=std/networking)
- [io](?p=std/io)
- [http](?p=std/http)
- [https](?p=std/https)
- [websocket](?p=std/websocket)
