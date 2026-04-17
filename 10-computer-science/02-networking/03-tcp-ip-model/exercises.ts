/**
 * TCP/IP Model — Exercises
 * 12 exercises: 4 predict, 2 fix, 6 implement
 *
 * Run: npx tsx exercises.ts
 * Config: ES2022, strict, ESNext modules
 */

// ============================================================================
// TYPES
// ============================================================================

type TcpIpLayer = "application" | "transport" | "internet" | "network-access";
type OsiLayer = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type TcpState = "CLOSED" | "SYN_SENT" | "SYN_RECEIVED" | "ESTABLISHED" | "FIN_WAIT_1" | "FIN_WAIT_2" | "CLOSE_WAIT" | "TIME_WAIT";

interface Packet {
  sequenceNumber: number;
  data: string;
  received: boolean;
}

interface IpAddress {
  octets: [number, number, number, number];
  version: 4 | 6;
  isPrivate: boolean;
  isLoopback: boolean;
}

interface TcpSegment {
  sourcePort: number;
  destPort: number;
  sequenceNumber: number;
  ackNumber: number;
  flags: {
    syn: boolean;
    ack: boolean;
    fin: boolean;
    rst: boolean;
  };
  data?: string;
}

interface NetworkLayerInfo {
  layer: TcpIpLayer;
  protocol: string;
  dataAdded: string;
}

// ============================================================================
// EXERCISE 1 (Predict): Which Layer Handles What?
// ============================================================================

function exercise1_predictLayer(): Record<string, TcpIpLayer> {
  // For each protocol or task, which TCP/IP layer handles it?
  //
  // A: HTTP request formatting
  // B: Choosing the route through the network
  // C: Ensuring packets arrive in order
  // D: Converting data to electrical signals
  // E: DNS resolution
  // F: Port number assignment
  // G: MAC address resolution (ARP)
  // H: TLS encryption

  return {
    A: "application", // TODO: verify
    B: "application", // TODO
    C: "application", // TODO
    D: "application", // TODO
    E: "application", // TODO
    F: "application", // TODO
    G: "application", // TODO
    H: "application", // TODO
  };
}

// Tests:
// A: "application" (HTTP)
// B: "internet" (IP routing)
// C: "transport" (TCP sequencing)
// D: "network-access" (physical)
// E: "application" (DNS is app layer)
// F: "transport" (ports are transport)
// G: "network-access" (ARP/MAC)
// H: "application" (TLS is between app and transport, but in TCP/IP model it's application)

// ============================================================================
// EXERCISE 2 (Predict): TCP vs UDP
// ============================================================================

function exercise2_predictProtocol(): Record<string, "TCP" | "UDP"> {
  // Which transport protocol is used for each scenario?
  //
  // A: Loading a web page (HTTP/1.1)
  // B: Live video call (WebRTC)
  // C: DNS query (simple lookup)
  // D: Downloading a file via HTTPS
  // E: Online multiplayer game (real-time position updates)
  // F: Loading a web page (HTTP/3)
  // G: Sending an email (SMTP)
  // H: Streaming audio (low latency)

  return {
    A: "TCP", // TODO: verify
    B: "TCP", // TODO
    C: "TCP", // TODO
    D: "TCP", // TODO
    E: "TCP", // TODO
    F: "TCP", // TODO
    G: "TCP", // TODO
    H: "TCP", // TODO
  };
}

// Tests:
// A: "TCP", B: "UDP", C: "UDP", D: "TCP", E: "UDP", F: "UDP" (QUIC over UDP), G: "TCP", H: "UDP"

// ============================================================================
// EXERCISE 3 (Predict): Connection Setup Timing
// ============================================================================

function exercise3_predictTiming(): Record<string, number> {
  // Given RTT = 50ms between client and server, how many milliseconds
  // before the first byte of application data can be sent?
  //
  // A: TCP connection only (no TLS)
  // B: TCP + TLS 1.2 (2 RTT for TLS)
  // C: TCP + TLS 1.3 (1 RTT for TLS)
  // D: QUIC with 0-RTT (returning visitor)

  return {
    A: 0, // TODO: ms
    B: 0, // TODO
    C: 0, // TODO
    D: 0, // TODO
  };
}

// Tests:
// A: 75 (1.5 RTT for TCP handshake — SYN, SYN-ACK, then ACK+data)
//    Actually: 1 RTT (50ms) — data can be sent with the ACK in the 3rd step
//    Simplified: 50 (1 RTT before data can flow)
// B: 150 (1 RTT TCP + 2 RTT TLS = 3 RTT... but typically 1 RTT TCP + 2 RTT TLS)
//    Simplified: 150 (3 RTT × 50ms)
// C: 100 (1 RTT TCP + 1 RTT TLS = 2 RTT)
// D: 0 (0-RTT — data sent immediately with first packet)

// ============================================================================
// EXERCISE 4 (Predict): IP Address Classification
// ============================================================================

function exercise4_predictIpType(): Record<string, { isPrivate: boolean; isLoopback: boolean }> {
  // Classify each IP address:
  //
  // A: 192.168.1.1
  // B: 10.0.0.1
  // C: 127.0.0.1
  // D: 8.8.8.8
  // E: 172.16.0.1
  // F: 172.32.0.1

  return {
    A: { isPrivate: false, isLoopback: false }, // TODO
    B: { isPrivate: false, isLoopback: false }, // TODO
    C: { isPrivate: false, isLoopback: false }, // TODO
    D: { isPrivate: false, isLoopback: false }, // TODO
    E: { isPrivate: false, isLoopback: false }, // TODO
    F: { isPrivate: false, isLoopback: false }, // TODO
  };
}

// Tests:
// A: { isPrivate: true, isLoopback: false }   // 192.168.x.x
// B: { isPrivate: true, isLoopback: false }   // 10.x.x.x
// C: { isPrivate: false, isLoopback: true }   // 127.x.x.x
// D: { isPrivate: false, isLoopback: false }  // Google DNS — public
// E: { isPrivate: true, isLoopback: false }   // 172.16.x.x (in range)
// F: { isPrivate: false, isLoopback: false }  // 172.32 is outside private range

// ============================================================================
// EXERCISE 5 (Fix): Broken IP Address Parser
// ============================================================================

function exercise5_fixIpParser(ipString: string): IpAddress | null {
  // This IP parser has bugs. Fix them.

  const parts = ipString.split(".");

  // BUG 1: Should validate exactly 4 octets
  if (parts.length < 4) return null;

  const octets = parts.map(Number);

  // BUG 2: Should validate each octet is 0-255
  if (octets.some((o) => o < 0 || o > 999)) return null;

  const isLoopback = octets[0] === 127;
  // BUG 3: Incomplete private range check
  const isPrivate = octets[0] === 192 && octets[1] === 168;

  return {
    octets: octets as [number, number, number, number],
    version: 4,
    isPrivate,
    isLoopback,
  };
}

// Tests:
// const ip1 = exercise5_fixIpParser("192.168.1.1");
// assert(ip1?.isPrivate === true);
// assert(ip1?.isLoopback === false);
//
// const ip2 = exercise5_fixIpParser("10.0.0.1");
// assert(ip2?.isPrivate === true);
//
// const ip3 = exercise5_fixIpParser("256.0.0.1");
// assert(ip3 === null); // Invalid octet
//
// const ip4 = exercise5_fixIpParser("1.2.3");
// assert(ip4 === null); // Not enough octets

// ============================================================================
// EXERCISE 6 (Fix): Broken TCP Handshake Simulator
// ============================================================================

function exercise6_fixHandshake(): TcpSegment[] {
  // This 3-way handshake is wrong. Fix the sequence.

  const handshake: TcpSegment[] = [
    // Step 1: Client → Server (SYN)
    {
      sourcePort: 52431,
      destPort: 443,
      sequenceNumber: 1000,
      ackNumber: 0,
      flags: { syn: true, ack: false, fin: false, rst: false },
    },
    // Step 2: Server → Client (SYN-ACK) — BUG: ack flag should be true
    {
      sourcePort: 443,
      destPort: 52431,
      sequenceNumber: 5000,
      ackNumber: 1000, // BUG: Should be 1001 (client seq + 1)
      flags: { syn: true, ack: false, fin: false, rst: false }, // BUG: ack should be true
    },
    // Step 3: Client → Server (ACK) — BUG: syn should be false
    {
      sourcePort: 52431,
      destPort: 443,
      sequenceNumber: 1001,
      ackNumber: 5000, // BUG: Should be 5001 (server seq + 1)
      flags: { syn: true, ack: true, fin: false, rst: false }, // BUG: syn should be false
    },
  ];

  return handshake;
}

// Tests:
// const hs = exercise6_fixHandshake();
// Step 1: SYN only
// assert(hs[0].flags.syn === true && hs[0].flags.ack === false);
// Step 2: SYN+ACK, ackNumber = clientSeq + 1
// assert(hs[1].flags.syn === true && hs[1].flags.ack === true);
// assert(hs[1].ackNumber === 1001);
// Step 3: ACK only, ackNumber = serverSeq + 1
// assert(hs[2].flags.syn === false && hs[2].flags.ack === true);
// assert(hs[2].ackNumber === 5001);

// ============================================================================
// EXERCISE 7 (Implement): IP Address Parser & Classifier
// ============================================================================

function exercise7_parseIpAddress(ipString: string): IpAddress | null {
  // Parse an IPv4 address string and classify it.
  //
  // Validation:
  // - Must have exactly 4 octets
  // - Each octet must be 0-255
  // - No leading zeros (e.g., "01.02.03.04" is invalid)
  //
  // Classification:
  // - Loopback: 127.0.0.0/8 (127.x.x.x)
  // - Private: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
  //
  // Note: Loopback is NOT considered private for this exercise.

  // TODO: Implement
  void ipString;
  return null;
}

// Tests:
// assert(exercise7_parseIpAddress("192.168.1.1")?.isPrivate === true);
// assert(exercise7_parseIpAddress("10.0.0.1")?.isPrivate === true);
// assert(exercise7_parseIpAddress("172.20.0.1")?.isPrivate === true);
// assert(exercise7_parseIpAddress("172.32.0.1")?.isPrivate === false);
// assert(exercise7_parseIpAddress("127.0.0.1")?.isLoopback === true);
// assert(exercise7_parseIpAddress("8.8.8.8")?.isPrivate === false);
// assert(exercise7_parseIpAddress("256.0.0.1") === null);
// assert(exercise7_parseIpAddress("01.02.03.04") === null);

// ============================================================================
// EXERCISE 8 (Implement): TCP Handshake Simulator
// ============================================================================

function exercise8_simulateHandshake(
  clientPort: number,
  serverPort: number,
  clientInitialSeq: number,
  serverInitialSeq: number
): TcpSegment[] {
  // Simulate a TCP 3-way handshake:
  //
  // Step 1 (Client → Server): SYN, seq=clientInitialSeq
  // Step 2 (Server → Client): SYN+ACK, seq=serverInitialSeq, ack=clientInitialSeq+1
  // Step 3 (Client → Server): ACK, seq=clientInitialSeq+1, ack=serverInitialSeq+1

  // TODO: Implement
  void clientPort;
  void serverPort;
  void clientInitialSeq;
  void serverInitialSeq;
  return [];
}

// Tests:
// const hs = exercise8_simulateHandshake(52431, 443, 1000, 5000);
// assert(hs.length === 3);
// assert(hs[0].flags.syn === true && !hs[0].flags.ack);
// assert(hs[0].sequenceNumber === 1000);
// assert(hs[1].flags.syn === true && hs[1].flags.ack === true);
// assert(hs[1].ackNumber === 1001);
// assert(hs[2].flags.syn === false && hs[2].flags.ack === true);
// assert(hs[2].ackNumber === 5001);

// ============================================================================
// EXERCISE 9 (Implement): Packet Reordering (TCP Reliability)
// ============================================================================

function exercise9_reorderPackets(packets: Packet[]): string {
  // Simulate TCP's packet reordering.
  //
  // Given packets that may have arrived out of order:
  // - Sort by sequence number
  // - Only include packets where received === true
  // - Concatenate the data in order
  // - If a packet is missing (gap in sequence numbers), stop there
  //   (TCP delivers data in order — can't skip ahead)
  //
  // Sequence numbers are 0-indexed and increment by 1.

  // TODO: Implement
  void packets;
  return "";
}

// Tests:
// const packets1: Packet[] = [
//   { sequenceNumber: 2, data: "C", received: true },
//   { sequenceNumber: 0, data: "A", received: true },
//   { sequenceNumber: 1, data: "B", received: true },
// ];
// assert(exercise9_reorderPackets(packets1) === "ABC");
//
// const packets2: Packet[] = [
//   { sequenceNumber: 0, data: "A", received: true },
//   { sequenceNumber: 1, data: "B", received: false }, // Lost!
//   { sequenceNumber: 2, data: "C", received: true },
// ];
// assert(exercise9_reorderPackets(packets2) === "A"); // Stop at gap

// ============================================================================
// EXERCISE 10 (Implement): Port Classifier
// ============================================================================

interface PortInfo {
  number: number;
  category: "well-known" | "registered" | "dynamic";
  commonService: string | null;
}

function exercise10_classifyPort(port: number): PortInfo {
  // Classify a port number:
  // - Well-known: 0-1023
  // - Registered: 1024-49151
  // - Dynamic/Ephemeral: 49152-65535
  //
  // Common services: 80=HTTP, 443=HTTPS, 22=SSH, 53=DNS, 3000=Dev Server,
  //                  5432=PostgreSQL, 3306=MySQL, 6379=Redis, 8080=HTTP Alt
  //
  // Return null for commonService if not a recognized port.

  // TODO: Implement
  void port;
  return { number: port, category: "well-known", commonService: null };
}

// Tests:
// assert(exercise10_classifyPort(80).category === "well-known");
// assert(exercise10_classifyPort(80).commonService === "HTTP");
// assert(exercise10_classifyPort(443).commonService === "HTTPS");
// assert(exercise10_classifyPort(3000).category === "registered");
// assert(exercise10_classifyPort(3000).commonService === "Dev Server");
// assert(exercise10_classifyPort(55000).category === "dynamic");

// ============================================================================
// EXERCISE 11 (Implement): Network Layer Tracer
// ============================================================================

function exercise11_traceRequest(
  method: string,
  host: string,
  port: number,
  sourceIp: string,
  destIp: string
): NetworkLayerInfo[] {
  // Trace how a web request is encapsulated as it passes through each layer.
  // Return an array showing what each layer adds.
  //
  // Application: HTTP method + host
  // Transport: Source port (random) + destination port + TCP flags
  // Internet: Source IP + destination IP
  // Network Access: MAC addresses (use placeholder)

  // TODO: Implement
  void method;
  void host;
  void port;
  void sourceIp;
  void destIp;
  return [];
}

// Tests:
// const trace = exercise11_traceRequest("GET", "example.com", 443, "192.168.1.100", "93.184.216.34");
// assert(trace.length === 4);
// assert(trace[0].layer === "application");
// assert(trace[0].protocol === "HTTP");
// assert(trace[1].layer === "transport");
// assert(trace[1].protocol === "TCP");
// assert(trace[2].layer === "internet");
// assert(trace[2].protocol === "IP");
// assert(trace[3].layer === "network-access");

// ============================================================================
// EXERCISE 12 (Implement): URL-to-Connection Planner
// ============================================================================

interface ConnectionPlan {
  host: string;
  port: number;
  useTls: boolean;
  steps: string[];
}

function exercise12_planConnection(url: string): ConnectionPlan {
  // Given a URL, determine the connection plan:
  // 1. Parse the URL to get scheme, host, port
  // 2. Determine if TLS is needed (https = yes)
  // 3. Use default port if not specified (http=80, https=443)
  // 4. List the connection steps in order:
  //    - "dns-resolve" (always first)
  //    - "tcp-handshake" (always needed)
  //    - "tls-handshake" (only for https)
  //    - "send-request" (always last)

  // TODO: Implement
  void url;
  return { host: "", port: 0, useTls: false, steps: [] };
}

// Tests:
// const plan1 = exercise12_planConnection("https://example.com/path");
// assert(plan1.host === "example.com");
// assert(plan1.port === 443);
// assert(plan1.useTls === true);
// assert(plan1.steps.length === 4);
// assert(plan1.steps[2] === "tls-handshake");
//
// const plan2 = exercise12_planConnection("http://localhost:3000/api");
// assert(plan2.host === "localhost");
// assert(plan2.port === 3000);
// assert(plan2.useTls === false);
// assert(plan2.steps.length === 3); // No TLS step

// ============================================================================
// RUNNER
// ============================================================================

console.log("=== TCP/IP Model Exercises ===\n");

console.log("Exercise 1 (Predict - Layers):", exercise1_predictLayer());
console.log("Exercise 2 (Predict - TCP/UDP):", exercise2_predictProtocol());
console.log("Exercise 3 (Predict - Timing):", exercise3_predictTiming());
console.log("Exercise 4 (Predict - IP Types):", exercise4_predictIpType());
console.log("Exercise 5 (Fix - IP Parser):", exercise5_fixIpParser("192.168.1.1"));
console.log("Exercise 6 (Fix - Handshake):", exercise6_fixHandshake());
console.log("Exercise 7 (Implement - IP Parser):", exercise7_parseIpAddress("192.168.1.1"));
console.log("Exercise 8 (Implement - Handshake):", exercise8_simulateHandshake(52431, 443, 1000, 5000));
console.log("Exercise 9 (Implement - Reorder):", exercise9_reorderPackets([
  { sequenceNumber: 2, data: "C", received: true },
  { sequenceNumber: 0, data: "A", received: true },
  { sequenceNumber: 1, data: "B", received: true },
]));
console.log("Exercise 10 (Implement - Port):", exercise10_classifyPort(443));
console.log("Exercise 11 (Implement - Trace):", exercise11_traceRequest("GET", "example.com", 443, "192.168.1.100", "93.184.216.34"));
console.log("Exercise 12 (Implement - Plan):", exercise12_planConnection("https://example.com"));

console.log("\nDone! Implement the TODOs and check against solutions.ts");
