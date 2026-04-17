// ============================================================================
// server-vs-client: Exercises
// ============================================================================
// Run:  npx tsx 03-nextjs/01-fundamentals/server-vs-client/exercises.ts
//
// Instructions:
//   - "Predict the output"  → fill in YOUR ANSWER below the question
//   - "Implement"           → write the function body
//
// When you're done, check your answers against solutions.ts
// ============================================================================

// ─── Types ──────────────────────────────────────────────────────────────────

type ComponentType = 'server' | 'client';

interface ComponentDef {
  name: string;
  type: ComponentType;
  imports: string[];
  usesHooks: string[];
  usesEvents: string[];
  children?: string[];
}

interface SerializableCheck {
  value: string;
  serializable: boolean;
  reason?: string;
}

interface RenderPhase {
  component: string;
  phase: 'server-render' | 'ssr' | 'hydrate' | 'client-only';
}

interface BundleAnalysis {
  component: string;
  inClientBundle: boolean;
  jsSize: 'none' | 'small' | 'medium' | 'large';
}

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: Identifying component types
//
// For each component, is it a Server or Client Component?

function exercise1(): void {
  const components = [
    { file: 'page.tsx', code: 'export default async function Page() { const data = await fetch(...) }' },
    { file: 'counter.tsx', code: '"use client"; import { useState } from "react"; ...' },
    { file: 'header.tsx', code: 'export default function Header() { return ... }' },
    { file: 'form.tsx', code: '"use client"; export default function Form() { const [v, setV] = useState("") }' },
    { file: 'footer.tsx', code: 'import { getYear } from "./utils"; export default function Footer() { ... }' },
  ];

  console.log("Exercise 1 - identify Server vs Client for each component");
}

// YOUR ANSWER:
// page.tsx    → ???
// counter.tsx → ???
// header.tsx  → ???
// form.tsx    → ???
// footer.tsx  → ???

// ─── Exercise 2: Implement ──────────────────────────────────────────────────
// Topic: Component type classifier
//
// Given a component definition, determine if it should be a Server or Client Component.

function exercise2(component: ComponentDef): {
  shouldBe: ComponentType;
  reasons: string[];
} {
  // TODO: Analyze the component and determine if it should be server or client
  // Rules:
  // - Uses hooks (useState, useEffect, etc.) → must be client
  // - Uses event handlers (onClick, onChange, etc.) → must be client
  // - Neither → should be server (default)
  return { shouldBe: 'server', reasons: [] };
}

// Test:
// exercise2({ name: 'Counter', type: 'server', imports: ['react'],
//   usesHooks: ['useState'], usesEvents: ['onClick'], children: [] })
// → { shouldBe: 'client', reasons: ['uses useState', 'uses onClick'] }

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: "use client" boundary propagation
//
// Given this import tree, which components end up as client code?

function exercise3(): void {
  const importTree = {
    'page.tsx': { directive: null, imports: ['ClientWrapper'] },
    'ClientWrapper.tsx': { directive: '"use client"', imports: ['HelperA', 'HelperB'] },
    'HelperA.tsx': { directive: null, imports: [] },
    'HelperB.tsx': { directive: null, imports: ['UtilC'] },
    'UtilC.tsx': { directive: null, imports: [] },
    'ServerSidebar.tsx': { directive: null, imports: [] },
  };

  // Which files become client code?
  console.log("Exercise 3 - identify which files become client code");
}

// YOUR ANSWER:
// page.tsx          → ???
// ClientWrapper.tsx → ???
// HelperA.tsx       → ???
// HelperB.tsx       → ???
// UtilC.tsx         → ???
// ServerSidebar.tsx → ???

// ─── Exercise 4: Implement ──────────────────────────────────────────────────
// Topic: Client boundary propagation
//
// Given an import graph and "use client" directives, determine which
// modules end up in the client bundle.

function exercise4(
  modules: Record<string, { directive: string | null; imports: string[] }>,
  entryPoint: string
): Record<string, { isClient: boolean; reason: string }> {
  // TODO: Walk the import graph from entryPoint
  // - Modules with "use client" are client modules
  // - All modules imported BY a client module are also client
  // - Modules only imported by server modules remain server
  return {};
}

// Test:
// exercise4({
//   'page.tsx': { directive: null, imports: ['ClientWrapper'] },
//   'ClientWrapper': { directive: '"use client"', imports: ['Helper'] },
//   'Helper': { directive: null, imports: [] },
// }, 'page.tsx')
// → {
//   'page.tsx': { isClient: false, reason: 'no directive, not imported by client' },
//   'ClientWrapper': { isClient: true, reason: 'has "use client" directive' },
//   'Helper': { isClient: true, reason: 'imported by client module ClientWrapper' },
// }

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: Serialization boundary
//
// Which of these props can be passed from Server to Client Component?

function exercise5(): void {
  const props = [
    { name: 'title', value: '"Hello World"', type: 'string' },
    { name: 'count', value: '42', type: 'number' },
    { name: 'onClick', value: '() => console.log("click")', type: 'function' },
    { name: 'data', value: '{ id: 1, name: "test" }', type: 'object' },
    { name: 'items', value: '[1, 2, 3]', type: 'array' },
    { name: 'handler', value: 'class Handler { }', type: 'class instance' },
    { name: 'action', value: 'async function marked with "use server"', type: 'server action' },
    { name: 'children', value: '<ServerChild />', type: 'react element' },
    { name: 'ref', value: 'Symbol("ref")', type: 'symbol' },
    { name: 'date', value: 'new Date()', type: 'Date' },
  ];

  console.log("Exercise 5 - predict serializable or not for each prop");
}

// YOUR ANSWER (serializable: yes/no):
// title    → ???
// count    → ???
// onClick  → ???
// data     → ???
// items    → ???
// handler  → ???
// action   → ???
// children → ???
// ref      → ???
// date     → ???

// ─── Exercise 6: Implement ──────────────────────────────────────────────────
// Topic: Serialization checker
//
// Check if a value type can cross the Server→Client boundary.

function exercise6(valueType: string): SerializableCheck {
  // TODO: Return whether the value type is serializable across
  // the server-client boundary, with a reason
  return { value: valueType, serializable: false };
}

// Test:
// exercise6('string')    → { value: 'string', serializable: true }
// exercise6('function')  → { value: 'function', serializable: false, reason: 'Functions cannot cross the boundary' }
// exercise6('server-action') → { value: 'server-action', serializable: true }

// ─── Exercise 7: Predict the Output ─────────────────────────────────────────
// Topic: Component rendering phases
//
// For this component tree, what renders in which phase?

function exercise7(): void {
  const tree = {
    'RootLayout': { type: 'server' },
    'ThemeProvider': { type: 'client', note: '"use client" context provider' },
    'ProductPage': { type: 'server', note: 'passed as children to ThemeProvider' },
    'AddToCartButton': { type: 'client' },
    'ProductDetails': { type: 'server' },
  };

  // For each component, in what phase does it render?
  // Phases: server-render, ssr, hydrate
  console.log("Exercise 7 - predict rendering phases");
}

// YOUR ANSWER:
// RootLayout       → renders during: ???
// ThemeProvider     → renders during: ???
// ProductPage      → renders during: ???
// AddToCartButton  → renders during: ???
// ProductDetails   → renders during: ???

// ─── Exercise 8: Implement ──────────────────────────────────────────────────
// Topic: Render phase calculator
//
// Given a component tree with types, determine the render phases.

function exercise8(
  components: Array<{ name: string; type: ComponentType; parentType?: ComponentType }>
): RenderPhase[] {
  // TODO: Determine render phase for each component
  // Server Components: 'server-render' only
  // Client Components: 'ssr' + 'hydrate'
  // (simplified: return the primary phase)
  return [];
}

// Test:
// exercise8([
//   { name: 'Layout', type: 'server' },
//   { name: 'Counter', type: 'client' },
//   { name: 'Footer', type: 'server' },
// ])
// → [
//   { component: 'Layout', phase: 'server-render' },
//   { component: 'Counter', phase: 'ssr' },
//   { component: 'Footer', phase: 'server-render' },
// ]

// ─── Exercise 9: Implement ──────────────────────────────────────────────────
// Topic: Bundle size analyzer
//
// Analyze which components contribute to the client JavaScript bundle.

function exercise9(
  components: ComponentDef[]
): BundleAnalysis[] {
  // TODO: Determine which components are in the client bundle
  // Server Components: inClientBundle = false, jsSize = 'none'
  // Client Components: inClientBundle = true, estimate size based on imports
  return [];
}

// Test:
// exercise9([
//   { name: 'Page', type: 'server', imports: ['db', 'fs'], usesHooks: [], usesEvents: [], children: ['Counter'] },
//   { name: 'Counter', type: 'client', imports: ['react'], usesHooks: ['useState'], usesEvents: ['onClick'] },
// ])
// → [
//   { component: 'Page', inClientBundle: false, jsSize: 'none' },
//   { component: 'Counter', inClientBundle: true, jsSize: 'small' },
// ]

// ─── Exercise 10: Predict the Output ────────────────────────────────────────
// Topic: Children pattern
//
// Does this composition work? Why or why not?

function exercise10(): void {
  const scenarios = [
    {
      description: 'Server Component passes Server Component as children to Client Component',
      code: `
        // page.tsx (server)
        <ClientDrawer>
          <ServerContent />  // Server Component as children
        </ClientDrawer>
      `,
    },
    {
      description: 'Client Component imports Server Component directly',
      code: `
        // "use client"
        import ServerContent from './ServerContent';
        // Uses <ServerContent /> in render
      `,
    },
    {
      description: 'Server Component renders Client Component with server data',
      code: `
        // page.tsx (server)
        const data = await fetchData();
        <ClientChart data={data} />
      `,
    },
  ];

  console.log("Exercise 10 - predict if each scenario works");
}

// YOUR ANSWER:
// Scenario 1 → works / doesn't work? Why?
// Scenario 2 → works / doesn't work? Why?
// Scenario 3 → works / doesn't work? Why?

// ─── Exercise 11: Implement ─────────────────────────────────────────────────
// Topic: Component tree validator
//
// Validate a component tree for correct Server/Client composition.

interface TreeNode {
  name: string;
  type: ComponentType;
  children: TreeNode[];
  propsFromParent?: string[];
}

interface ValidationError {
  component: string;
  error: string;
}

function exercise11(tree: TreeNode): ValidationError[] {
  // TODO: Validate the component tree
  // Rules:
  // - Server Components cannot use hooks or event handlers (check usesHooks/usesEvents if provided)
  // - Client Components cannot directly import Server Components
  //   (but CAN receive them as children/props)
  // - Non-serializable props cannot cross the boundary
  return [];
}

// Test:
// exercise11({
//   name: 'Page', type: 'server', children: [
//     { name: 'Counter', type: 'client', children: [], propsFromParent: ['count', 'onIncrement'] },
//   ]
// })
// → [{ component: 'Counter', error: 'Non-serializable prop "onIncrement" (function) passed from server' }]

// ─── Exercise 12: Implement ─────────────────────────────────────────────────
// Topic: Optimal boundary placement
//
// Given a component tree, find the optimal placement of "use client" boundaries
// to minimize client JavaScript while maintaining interactivity.

interface ComponentRequirements {
  name: string;
  needsInteractivity: boolean;
  estimatedSize: number; // KB
  children: string[];
}

function exercise12(
  components: ComponentRequirements[]
): { clientBoundaries: string[]; totalClientKB: number; totalServerKB: number } {
  // TODO: Find optimal "use client" boundary placement
  // - Components needing interactivity must be client
  // - Minimize total client bundle size
  // - A parent being client makes all children client too (if imported directly)
  return { clientBoundaries: [], totalClientKB: 0, totalServerKB: 0 };
}

// Test:
// exercise12([
//   { name: 'Page', needsInteractivity: false, estimatedSize: 50, children: ['Header', 'Content', 'Footer'] },
//   { name: 'Header', needsInteractivity: false, estimatedSize: 10, children: ['SearchBar'] },
//   { name: 'SearchBar', needsInteractivity: true, estimatedSize: 5, children: [] },
//   { name: 'Content', needsInteractivity: false, estimatedSize: 30, children: [] },
//   { name: 'Footer', needsInteractivity: false, estimatedSize: 5, children: [] },
// ])
// → { clientBoundaries: ['SearchBar'], totalClientKB: 5, totalServerKB: 95 }

// ─── Exercise 13: Implement ─────────────────────────────────────────────────
// Topic: Data flow pattern simulator
//
// Simulate data flowing from server to client and back.

interface DataFlowStep {
  from: string;
  to: string;
  data: string;
  mechanism: 'props' | 'server-action' | 'api-route' | 'children' | 'url-params';
  direction: 'server→client' | 'client→server';
}

function exercise13(
  steps: DataFlowStep[]
): Array<{ step: number; valid: boolean; reason: string }> {
  // TODO: Validate each data flow step
  // - props: only server→client, must be serializable
  // - server-action: client→server
  // - api-route: client→server
  // - children: server→client (React elements)
  // - url-params: bidirectional
  return [];
}

// ─── Exercise 14: Implement ─────────────────────────────────────────────────
// Topic: "use client" refactoring advisor
//
// Given a component with mixed concerns, suggest how to refactor it.

interface MixedComponent {
  name: string;
  features: Array<{
    description: string;
    needsServer: boolean;  // needs DB, fs, secrets
    needsClient: boolean;  // needs hooks, events, browser API
  }>;
}

function exercise14(component: MixedComponent): {
  serverComponent: { name: string; features: string[] };
  clientComponent: { name: string; features: string[] };
  pattern: string;
} {
  // TODO: Split the component into server and client parts
  return {
    serverComponent: { name: '', features: [] },
    clientComponent: { name: '', features: [] },
    pattern: '',
  };
}

// Test:
// exercise14({
//   name: 'ProductPage',
//   features: [
//     { description: 'Fetch product from DB', needsServer: true, needsClient: false },
//     { description: 'Display product info', needsServer: false, needsClient: false },
//     { description: 'Add to cart button', needsServer: false, needsClient: true },
//     { description: 'Image gallery with zoom', needsServer: false, needsClient: true },
//   ]
// })
// → {
//   serverComponent: { name: 'ProductPage', features: ['Fetch product from DB', 'Display product info'] },
//   clientComponent: { name: 'ProductPageClient', features: ['Add to cart button', 'Image gallery with zoom'] },
//   pattern: 'Server wrapper with client islands',
// }

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
// Topic: Full component tree renderer simulation
//
// Simulate the rendering of a component tree, tracking which components
// render on server vs client and what data crosses the boundary.

interface SimComponent {
  name: string;
  type: ComponentType;
  props: Record<string, { type: string; serializable: boolean }>;
  children: SimComponent[];
}

interface RenderResult {
  component: string;
  renderedOn: 'server' | 'client' | 'both';
  propsReceived: string[];
  errors: string[];
}

function exercise15(root: SimComponent): RenderResult[] {
  // TODO: Walk the tree and simulate rendering
  // Server components render on server only
  // Client components render on both (SSR + hydration)
  // Check prop serialization at boundaries
  return [];
}

export {
  exercise1, exercise2, exercise3, exercise4, exercise5,
  exercise6, exercise7, exercise8, exercise9, exercise10,
  exercise11, exercise12, exercise13, exercise14, exercise15,
};
