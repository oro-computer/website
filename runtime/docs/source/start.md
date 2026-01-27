# Oro Runtime Documentation

Oro Runtime embeds the platform WebView and exposes native capabilities to JavaScript via high-level `oro:*` APIs.

These docs are the reference for the runtime’s architecture, subsystems, and integration surfaces (TLS, storage,
windowing, MCP, AI, and more). Use the sidebar to browse, or search for a specific concept.

## Recommended reading path

1. Architecture: [Oro Runtime Architecture](?p=RUNTIME_ARCHITECTURE)
2. Resource loading: [Navigator mounts](?p=NAVIGATOR_MOUNTS) and [Conduit](?p=CONDUIT)
3. Platform behavior: [Window management](?p=WINDOW_MANAGEMENT) and [Android storage](?p=ANDROID_STORAGE)
4. Security: [Secure storage](?p=SECURE_STORAGE) and [Sandbox helper](?p=SANDBOX_HELPER)
5. Networking: [TLS quickstart](?p=TLS_QUICKSTART), [TLS testing](?p=TLS_TESTING), and [WebView TLS pins](?p=WEBVIEW_TLS_PINS)
6. Web platform surfaces: [WebUSB](?p=webusb), [Web Bluetooth](?p=WEB_BLUETOOTH_STATUS), [Web HID](?p=WEB_HID_STATUS), [Web OTP](?p=WEB_OTP)
7. Agent integrations: [MCP server configuration](?p=MCP) and [Embedded LLaMA server](?p=AI_SERVER)

## Contributing and source code

Runtime development happens in the `oro-computer/oro-runtime` repository on GitHub.

