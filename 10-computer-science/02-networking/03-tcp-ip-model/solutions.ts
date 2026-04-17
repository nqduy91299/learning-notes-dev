/**
 * TCP/IP Model — Solutions
 * 12 exercises: 4 predict, 2 fix, 6 implement
 *
 * Run: npx tsx solutions.ts
 * Config: ES2022, strict, ESNext modules
 */

// ============================================================================
// TYPES
// ============================================================================

type TcpIpLayer = "application" | "transport" | "internet" | "network-access";

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

interface PortInfo {
  number: number;
  category: "well-known" | "registered" | "dynamic";
  commonService: string | null;
}

interface ConnectionPlan {
  host: string;
  port: number;
  useTls: boolean;
  steps: string[];
}

// ============================================================================
// Helpers
// ============================================================================

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string): void {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error(`  FAIL: ${label}`);
  }
}

function section(name: string): void {
  console.log(`\n--- ${name} ---`);
}

// ============================================================================
// SOLUTION 1: Predict Layer
// ============================================================================

function solution1_predictLayer(): Record<string, TcpIpLayer> {
  return {
    A: "application",    // HTTP
    B: "internet",       // IP routing
    C: "transport",      // TCP sequencing
    D: "network-access", // Physical signals
    E: "application",    // DNS
    F: "transport",      // Ports
    G: "network-access", // ARP/MAC
    H: "application",    // TLS (in TCP/IP model)
  };
}

// ============================================================================
// SOLUTION 2: Predict Protocol
// ============================================================================

function solution2_predictProtocol(): Record<string, "TCP" | "UDP"> {
  return {
    A: "TCP",  // HTTP/1.1
    B: "UDP",  // WebRTC
    C: "UDP",  // DNS
    D: "TCP",  // HTTPS file download
    E: "UDP",  // Gaming real-time
    F: "UDP",  // HTTP/3 (QUIC)
    G: "TCP",  // SMTP
    H: "UDP",  // Low-latency audio
  };
}

// ============================================================================
// SOLUTION 3: Predict Timing
// ============================================================================

function solution3_predictTiming(): Record<string, number> {
  return {
    A: 50,  // 1 RTT for TCP handshake
    B: 150, // 1 RTT TCP + 2 RTT TLS 1.2
    C: 100, // 1 RTT TCP + 1 RTT TLS 1.3
    D: 0,   // QUIC 0-RTT
  };
}

// ============================================================================
// SOLUTION 4: Predict IP Type
// ============================================================================

function solution4_predictIpType(): Record<string, { isPrivate: boolean; isLoopback: boolean }> {
  return {
    A: { isPrivate: true, isLoopback: false },
    B: { isPrivate: true, isLoopback: false },
    C: { isPrivate: false, isLoopback: true },
    D: { isPrivate: false, isLoopback: false },
    E: { isPrivate: true, isLoopback: false },
    F: { isPrivate: false, isLoopback: false },
  };
}

// ============================================================================
// SOLUTION 5: Fix IP Parser
// ============================================================================

function solution5_fixIpParser(ipString: string): IpAddress | null {
  const parts = ipString.split(".");

  // FIX 1: Exactly 4 octets
  if (parts.length !== 4) return null;

  const octets = parts.map(Number);

  // FIX 2: Each octet 0-255
  if (octets.some((o) => isNaN(o) || o < 0 || o > 255)) return null;

  const isLoopback = octets[0] === 127;

  // FIX 3: Complete private range check
  const isPrivate =
    octets[0] === 10 ||
    (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
    (octets[0] === 192 && octets[1] === 168);

  return {
    octets: octets as [number, number, number, number],
    version: 4,
    isPrivate,
    isLoopback,
  };
}

// ============================================================================
// SOLUTION 6: Fix Handshake
// ============================================================================

function solution6_fixHandshake(): TcpSegment[] {
  return [
    // Step 1: SYN
    {
      sourcePort: 52431,
      destPort: 443,
      sequenceNumber: 1000,
      ackNumber: 0,
      flags: { syn: true, ack: false, fin: false, rst: false },
    },
    // Step 2: SYN-ACK — FIX: ack=true, ackNumber=1001
    {
      sourcePort: 443,
      destPort: 52431,
      sequenceNumber: 5000,
      ackNumber: 1001,
      flags: { syn: true, ack: true, fin: false, rst: false },
    },
    // Step 3: ACK — FIX: syn=false, ackNumber=5001
    {
      sourcePort: 52431,
      destPort: 443,
      sequenceNumber: 1001,
      ackNumber: 5001,
      flags: { syn: false, ack: true, fin: false, rst: false },
    },
  ];
}

// ============================================================================
// SOLUTION 7: IP Address Parser & Classifier
// ============================================================================

function solution7_parseIpAddress(ipString: string): IpAddress | null {
  const parts = ipString.split(".");

  if (parts.length !== 4) return null;

  // Check for leading zeros
  for (const part of parts) {
    if (part.length > 1 && part.startsWith("0")) return null;
    if (part === "") return null;
  }

  const octets = parts.map(Number);

  if (octets.some((o) => isNaN(o) || o < 0 || o > 255 || !Number.isInteger(o))) {
    return null;
  }

  const isLoopback = octets[0] === 127;

  const isPrivate =
    octets[0] === 10 ||
    (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
    (octets[0] === 192 && octets[1] === 168);

  return {
    octets: octets as [number, number, number, number],
    version: 4,
    isPrivate,
    isLoopback,
  };
}

// ============================================================================
// SOLUTION 8: TCP Handshake Simulator
// ============================================================================

function solution8_simulateHandshake(
  clientPort: number,
  serverPort: number,
  clientInitialSeq: number,
  serverInitialSeq: number
): TcpSegment[] {
  return [
    {
      sourcePort: clientPort,
      destPort: serverPort,
      sequenceNumber: clientInitialSeq,
      ackNumber: 0,
      flags: { syn: true, ack: false, fin: false, rst: false },
    },
    {
      sourcePort: serverPort,
      destPort: clientPort,
      sequenceNumber: serverInitialSeq,
      ackNumber: clientInitialSeq + 1,
      flags: { syn: true, ack: true, fin: false, rst: false },
    },
    {
      sourcePort: clientPort,
      destPort: serverPort,
      sequenceNumber: clientInitialSeq + 1,
      ackNumber: serverInitialSeq + 1,
      flags: { syn: false, ack: true, fin: false, rst: false },
    },
  ];
}

// ============================================================================
// SOLUTION 9: Packet Reordering
// ============================================================================

function solution9_reorderPackets(packets: Packet[]): string {
  const received = packets
    .filter((p) => p.received)
    .sort((a, b) => a.sequenceNumber - b.sequenceNumber);

  let result = "";
  let expectedSeq = 0;

  for (const packet of received) {
    if (packet.sequenceNumber !== expectedSeq) break;
    result += packet.data;
    expectedSeq++;
  }

  return result;
}

// ============================================================================
// SOLUTION 10: Port Classifier
// ============================================================================

function solution10_classifyPort(port: number): PortInfo {
  const services: Record<number, string> = {
    22: "SSH",
    53: "DNS",
    80: "HTTP",
    443: "HTTPS",
    3000: "Dev Server",
    3306: "MySQL",
    5432: "PostgreSQL",
    6379: "Redis",
    8080: "HTTP Alt",
  };

  let category: "well-known" | "registered" | "dynamic";
  if (port <= 1023) {
    category = "well-known";
  } else if (port <= 49151) {
    category = "registered";
  } else {
    category = "dynamic";
  }

  return {
    number: port,
    category,
    commonService: services[port] ?? null,
  };
}

// ============================================================================
// SOLUTION 11: Network Layer Tracer
// ============================================================================

function solution11_traceRequest(
  method: string,
  host: string,
  port: number,
  sourceIp: string,
  destIp: string
): NetworkLayerInfo[] {
  return [
    {
      layer: "application",
      protocol: "HTTP",
      dataAdded: `${method} / HTTP/1.1 | Host: ${host}`,
    },
    {
      layer: "transport",
      protocol: "TCP",
      dataAdded: `Source Port: ephemeral | Dest Port: ${port} | Flags: ACK`,
    },
    {
      layer: "internet",
      protocol: "IP",
      dataAdded: `Source IP: ${sourceIp} | Dest IP: ${destIp}`,
    },
    {
      layer: "network-access",
      protocol: "Ethernet",
      dataAdded: `Source MAC: AA:BB:CC:DD:EE:FF | Dest MAC: 11:22:33:44:55:66`,
    },
  ];
}

// ============================================================================
// SOLUTION 12: URL-to-Connection Planner
// ============================================================================

function solution12_planConnection(url: string): ConnectionPlan {
  const parsed = new URL(url);
  const useTls = parsed.protocol === "https:";
  const defaultPort = useTls ? 443 : 80;
  const port = parsed.port ? parseInt(parsed.port, 10) : defaultPort;

  const steps = ["dns-resolve", "tcp-handshake"];
  if (useTls) steps.push("tls-handshake");
  steps.push("send-request");

  return {
    host: parsed.hostname,
    port,
    useTls,
    steps,
  };
}

// ============================================================================
// TEST RUNNER
// ============================================================================

console.log("=== TCP/IP Model — Solutions & Tests ===");

// Exercise 1
section("Exercise 1: Predict Layer");
const s1 = solution1_predictLayer();
assert(s1.A === "application", "HTTP = application");
assert(s1.B === "internet", "Routing = internet");
assert(s1.C === "transport", "Ordering = transport");
assert(s1.D === "network-access", "Physical = network-access");
assert(s1.E === "application", "DNS = application");
assert(s1.F === "transport", "Ports = transport");
assert(s1.G === "network-access", "ARP = network-access");
assert(s1.H === "application", "TLS = application");

// Exercise 2
section("Exercise 2: Predict Protocol");
const s2 = solution2_predictProtocol();
assert(s2.A === "TCP", "HTTP/1.1 = TCP");
assert(s2.B === "UDP", "WebRTC = UDP");
assert(s2.C === "UDP", "DNS = UDP");
assert(s2.D === "TCP", "HTTPS download = TCP");
assert(s2.E === "UDP", "Gaming = UDP");
assert(s2.F === "UDP", "HTTP/3 = UDP");
assert(s2.G === "TCP", "SMTP = TCP");
assert(s2.H === "UDP", "Audio streaming = UDP");

// Exercise 3
section("Exercise 3: Predict Timing");
const s3 = solution3_predictTiming();
assert(s3.A === 50, "TCP only = 50ms");
assert(s3.B === 150, "TCP + TLS 1.2 = 150ms");
assert(s3.C === 100, "TCP + TLS 1.3 = 100ms");
assert(s3.D === 0, "QUIC 0-RTT = 0ms");

// Exercise 4
section("Exercise 4: Predict IP Type");
const s4 = solution4_predictIpType();
assert(s4.A.isPrivate === true, "192.168.1.1 is private");
assert(s4.B.isPrivate === true, "10.0.0.1 is private");
assert(s4.C.isLoopback === true, "127.0.0.1 is loopback");
assert(s4.D.isPrivate === false, "8.8.8.8 is public");
assert(s4.E.isPrivate === true, "172.16.0.1 is private");
assert(s4.F.isPrivate === false, "172.32.0.1 is NOT private");

// Exercise 5
section("Exercise 5: Fix IP Parser");
const ip1 = solution5_fixIpParser("192.168.1.1");
assert(ip1?.isPrivate === true, "192.168 is private");
const ip2 = solution5_fixIpParser("10.0.0.1");
assert(ip2?.isPrivate === true, "10.x is private");
const ip3 = solution5_fixIpParser("256.0.0.1");
assert(ip3 === null, "256 is invalid");
const ip4 = solution5_fixIpParser("1.2.3");
assert(ip4 === null, "3 octets invalid");

// Exercise 6
section("Exercise 6: Fix Handshake");
const hs6 = solution6_fixHandshake();
assert(hs6[0].flags.syn === true && !hs6[0].flags.ack, "Step 1: SYN only");
assert(hs6[1].flags.syn === true && hs6[1].flags.ack === true, "Step 2: SYN+ACK");
assert(hs6[1].ackNumber === 1001, "Step 2: ack = client seq + 1");
assert(hs6[2].flags.syn === false && hs6[2].flags.ack === true, "Step 3: ACK only");
assert(hs6[2].ackNumber === 5001, "Step 3: ack = server seq + 1");

// Exercise 7
section("Exercise 7: IP Parser");
assert(solution7_parseIpAddress("192.168.1.1")?.isPrivate === true, "192.168 private");
assert(solution7_parseIpAddress("10.0.0.1")?.isPrivate === true, "10.x private");
assert(solution7_parseIpAddress("172.20.0.1")?.isPrivate === true, "172.20 private");
assert(solution7_parseIpAddress("172.32.0.1")?.isPrivate === false, "172.32 not private");
assert(solution7_parseIpAddress("127.0.0.1")?.isLoopback === true, "127 loopback");
assert(solution7_parseIpAddress("8.8.8.8")?.isPrivate === false, "8.8.8.8 public");
assert(solution7_parseIpAddress("256.0.0.1") === null, "256 invalid");
assert(solution7_parseIpAddress("01.02.03.04") === null, "Leading zeros invalid");

// Exercise 8
section("Exercise 8: Handshake Simulator");
const hs8 = solution8_simulateHandshake(52431, 443, 1000, 5000);
assert(hs8.length === 3, "3 segments");
assert(hs8[0].flags.syn === true && !hs8[0].flags.ack, "SYN");
assert(hs8[0].sequenceNumber === 1000, "Client initial seq");
assert(hs8[1].flags.syn === true && hs8[1].flags.ack === true, "SYN+ACK");
assert(hs8[1].ackNumber === 1001, "Server acks client+1");
assert(hs8[2].flags.syn === false && hs8[2].flags.ack === true, "ACK");
assert(hs8[2].ackNumber === 5001, "Client acks server+1");

// Exercise 9
section("Exercise 9: Packet Reordering");
assert(
  solution9_reorderPackets([
    { sequenceNumber: 2, data: "C", received: true },
    { sequenceNumber: 0, data: "A", received: true },
    { sequenceNumber: 1, data: "B", received: true },
  ]) === "ABC",
  "Reordered correctly"
);
assert(
  solution9_reorderPackets([
    { sequenceNumber: 0, data: "A", received: true },
    { sequenceNumber: 1, data: "B", received: false },
    { sequenceNumber: 2, data: "C", received: true },
  ]) === "A",
  "Stops at gap"
);
assert(
  solution9_reorderPackets([
    { sequenceNumber: 1, data: "B", received: true },
  ]) === "",
  "Missing seq 0 = empty"
);

// Exercise 10
section("Exercise 10: Port Classifier");
assert(solution10_classifyPort(80).category === "well-known", "80 well-known");
assert(solution10_classifyPort(80).commonService === "HTTP", "80 = HTTP");
assert(solution10_classifyPort(443).commonService === "HTTPS", "443 = HTTPS");
assert(solution10_classifyPort(3000).category === "registered", "3000 registered");
assert(solution10_classifyPort(3000).commonService === "Dev Server", "3000 = Dev Server");
assert(solution10_classifyPort(55000).category === "dynamic", "55000 dynamic");
assert(solution10_classifyPort(12345).commonService === null, "Unknown port");

// Exercise 11
section("Exercise 11: Layer Tracer");
const trace11 = solution11_traceRequest("GET", "example.com", 443, "192.168.1.100", "93.184.216.34");
assert(trace11.length === 4, "4 layers");
assert(trace11[0].layer === "application", "First = application");
assert(trace11[0].protocol === "HTTP", "App protocol = HTTP");
assert(trace11[1].layer === "transport", "Second = transport");
assert(trace11[2].layer === "internet", "Third = internet");
assert(trace11[3].layer === "network-access", "Fourth = network-access");

// Exercise 12
section("Exercise 12: Connection Planner");
const plan1 = solution12_planConnection("https://example.com/path");
assert(plan1.host === "example.com", "Host parsed");
assert(plan1.port === 443, "Default HTTPS port");
assert(plan1.useTls === true, "HTTPS uses TLS");
assert(plan1.steps.length === 4, "4 steps with TLS");
assert(plan1.steps[2] === "tls-handshake", "TLS step present");

const plan2 = solution12_planConnection("http://localhost:3000/api");
assert(plan2.host === "localhost", "Localhost host");
assert(plan2.port === 3000, "Custom port");
assert(plan2.useTls === false, "HTTP no TLS");
assert(plan2.steps.length === 3, "3 steps without TLS");

// ============================================================================
// SUMMARY
// ============================================================================

console.log(`\n=== Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests ===`);
if (failed > 0) process.exit(1);
