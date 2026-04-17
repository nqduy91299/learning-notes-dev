// ============================================================================
// server-vs-client: Solutions
// ============================================================================
// Compare these with your answers in exercises.ts.
// ============================================================================

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

interface ComponentRequirements {
  name: string;
  needsInteractivity: boolean;
  estimatedSize: number;
  children: string[];
}

interface DataFlowStep {
  from: string;
  to: string;
  data: string;
  mechanism: 'props' | 'server-action' | 'api-route' | 'children' | 'url-params';
  direction: 'server→client' | 'client→server';
}

interface MixedComponent {
  name: string;
  features: Array<{
    description: string;
    needsServer: boolean;
    needsClient: boolean;
  }>;
}

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

// ─── Exercise 1 ─────────────────────────────────────────────────────────────
// ANSWER:
// page.tsx    → Server (no "use client", uses async + fetch)
// counter.tsx → Client (has "use client" directive)
// header.tsx  → Server (no directive, no hooks/events)
// form.tsx    → Client (has "use client" directive)
// footer.tsx  → Server (no directive, no hooks/events)

function solution1(): void {
  const answers = [
    { file: 'page.tsx', type: 'Server', reason: 'No directive, async data fetching' },
    { file: 'counter.tsx', type: 'Client', reason: '"use client" + useState' },
    { file: 'header.tsx', type: 'Server', reason: 'No directive, no interactivity' },
    { file: 'form.tsx', type: 'Client', reason: '"use client" + useState' },
    { file: 'footer.tsx', type: 'Server', reason: 'No directive' },
  ];
  answers.forEach(a => console.log(`${a.file} → ${a.type} (${a.reason})`));
}

// ─── Exercise 2 ─────────────────────────────────────────────────────────────
function solution2(component: ComponentDef): {
  shouldBe: ComponentType;
  reasons: string[];
} {
  const reasons: string[] = [];

  for (const hook of component.usesHooks) {
    reasons.push(`uses ${hook}`);
  }
  for (const event of component.usesEvents) {
    reasons.push(`uses ${event}`);
  }

  if (reasons.length > 0) {
    return { shouldBe: 'client', reasons };
  }

  return { shouldBe: 'server', reasons: ['No hooks or event handlers needed'] };
}

// ─── Exercise 3 ─────────────────────────────────────────────────────────────
// ANSWER:
// page.tsx          → Server (imports ClientWrapper but doesn't become client)
// ClientWrapper.tsx → Client (has "use client")
// HelperA.tsx       → Client (imported by ClientWrapper)
// HelperB.tsx       → Client (imported by ClientWrapper)
// UtilC.tsx         → Client (imported by HelperB, which is client)
// ServerSidebar.tsx → Server (not imported by any client module)

function solution3(): void {
  const answers = [
    { file: 'page.tsx', isClient: false, reason: 'Entry point, no directive' },
    { file: 'ClientWrapper.tsx', isClient: true, reason: 'Has "use client"' },
    { file: 'HelperA.tsx', isClient: true, reason: 'Imported by ClientWrapper' },
    { file: 'HelperB.tsx', isClient: true, reason: 'Imported by ClientWrapper' },
    { file: 'UtilC.tsx', isClient: true, reason: 'Imported by HelperB (client chain)' },
    { file: 'ServerSidebar.tsx', isClient: false, reason: 'Not in any client import chain' },
  ];
  answers.forEach(a => console.log(`${a.file} → ${a.isClient ? 'Client' : 'Server'} (${a.reason})`));
}

// ─── Exercise 4 ─────────────────────────────────────────────────────────────
function solution4(
  modules: Record<string, { directive: string | null; imports: string[] }>,
  entryPoint: string
): Record<string, { isClient: boolean; reason: string }> {
  const result: Record<string, { isClient: boolean; reason: string }> = {};
  const clientModules = new Set<string>();

  // First pass: find all modules with "use client"
  for (const [name, mod] of Object.entries(modules)) {
    if (mod.directive === '"use client"') {
      clientModules.add(name);
    }
  }

  // Second pass: propagate client status through imports
  let changed = true;
  while (changed) {
    changed = false;
    for (const name of clientModules) {
      const mod = modules[name];
      if (!mod) continue;
      for (const imp of mod.imports) {
        if (!clientModules.has(imp)) {
          clientModules.add(imp);
          changed = true;
        }
      }
    }
  }

  // Build result
  for (const name of Object.keys(modules)) {
    if (modules[name].directive === '"use client"') {
      result[name] = { isClient: true, reason: 'has "use client" directive' };
    } else if (clientModules.has(name)) {
      // Find which client module imports it
      const importedBy = Object.entries(modules)
        .find(([n, m]) => clientModules.has(n) && m.imports.includes(name));
      result[name] = { isClient: true, reason: `imported by client module ${importedBy?.[0]}` };
    } else {
      result[name] = { isClient: false, reason: 'no directive, not imported by client' };
    }
  }

  return result;
}

// ─── Exercise 5 ─────────────────────────────────────────────────────────────
// ANSWER:
// title    → yes (string is serializable)
// count    → yes (number is serializable)
// onClick  → NO (functions cannot cross boundary)
// data     → yes (plain object with serializable values)
// items    → yes (array of numbers)
// handler  → NO (class instances not serializable)
// action   → yes (Server Actions are special — they cross the boundary)
// children → yes (React elements are serializable)
// ref      → NO (Symbols not serializable)
// date     → yes (Date serialized as string)

function solution5(): void {
  const answers = [
    { name: 'title', serializable: true },
    { name: 'count', serializable: true },
    { name: 'onClick', serializable: false, reason: 'functions cannot cross boundary' },
    { name: 'data', serializable: true },
    { name: 'items', serializable: true },
    { name: 'handler', serializable: false, reason: 'class instances not serializable' },
    { name: 'action', serializable: true, reason: 'Server Actions are special' },
    { name: 'children', serializable: true, reason: 'React elements cross the boundary' },
    { name: 'ref', serializable: false, reason: 'Symbols not serializable' },
    { name: 'date', serializable: true, reason: 'Date serialized as string' },
  ];
  answers.forEach(a => console.log(`${a.name} → ${a.serializable ? 'yes' : 'NO'}${a.reason ? ` (${a.reason})` : ''}`));
}

// ─── Exercise 6 ─────────────────────────────────────────────────────────────
function solution6(valueType: string): SerializableCheck {
  const rules: Record<string, { serializable: boolean; reason?: string }> = {
    'string': { serializable: true },
    'number': { serializable: true },
    'boolean': { serializable: true },
    'null': { serializable: true },
    'undefined': { serializable: true },
    'object': { serializable: true, reason: 'Plain objects with serializable values' },
    'array': { serializable: true },
    'date': { serializable: true, reason: 'Serialized as ISO string' },
    'function': { serializable: false, reason: 'Functions cannot cross the boundary' },
    'class': { serializable: false, reason: 'Class instances are not serializable' },
    'symbol': { serializable: false, reason: 'Symbols are not serializable' },
    'server-action': { serializable: true, reason: 'Server Actions use a special reference mechanism' },
    'react-element': { serializable: true, reason: 'React elements (JSX) can cross the boundary' },
    'promise': { serializable: true, reason: 'Promises can be used with Suspense' },
    'map': { serializable: true, reason: 'Supported in newer React versions' },
    'set': { serializable: true, reason: 'Supported in newer React versions' },
  };

  const rule = rules[valueType.toLowerCase()];
  if (rule) {
    return { value: valueType, ...rule };
  }
  return { value: valueType, serializable: false, reason: 'Unknown type' };
}

// ─── Exercise 7 ─────────────────────────────────────────────────────────────
// ANSWER:
// RootLayout       → server-render (Server Component)
// ThemeProvider     → ssr + hydrate (Client Component)
// ProductPage      → server-render (Server Component, passed as children)
// AddToCartButton  → ssr + hydrate (Client Component)
// ProductDetails   → server-render (Server Component)

function solution7(): void {
  const answers = [
    { name: 'RootLayout', phase: 'server-render', reason: 'Server Component' },
    { name: 'ThemeProvider', phase: 'ssr + hydrate', reason: 'Client Component' },
    { name: 'ProductPage', phase: 'server-render', reason: 'Server Component (children pattern)' },
    { name: 'AddToCartButton', phase: 'ssr + hydrate', reason: 'Client Component' },
    { name: 'ProductDetails', phase: 'server-render', reason: 'Server Component' },
  ];
  answers.forEach(a => console.log(`${a.name} → ${a.phase} (${a.reason})`));
}

// ─── Exercise 8 ─────────────────────────────────────────────────────────────
function solution8(
  components: Array<{ name: string; type: ComponentType; parentType?: ComponentType }>
): RenderPhase[] {
  return components.map(c => ({
    component: c.name,
    phase: c.type === 'server' ? 'server-render' as const : 'ssr' as const,
  }));
}

// ─── Exercise 9 ─────────────────────────────────────────────────────────────
function solution9(components: ComponentDef[]): BundleAnalysis[] {
  return components.map(c => {
    if (c.type === 'server') {
      return { component: c.name, inClientBundle: false, jsSize: 'none' as const };
    }
    const size = c.imports.length <= 1 ? 'small' as const
      : c.imports.length <= 3 ? 'medium' as const : 'large' as const;
    return { component: c.name, inClientBundle: true, jsSize: size };
  });
}

// ─── Exercise 10 ────────────────────────────────────────────────────────────
// ANSWER:
// Scenario 1 → WORKS. The children pattern. Server Component is rendered on the
//   server, serialized as React elements, and passed as children prop to the Client
//   Component. The Client Component receives pre-rendered content.
//
// Scenario 2 → DOES NOT WORK as expected. When a Client Component imports a module,
//   that module becomes client code. ServerContent loses its server capabilities.
//   It effectively becomes a Client Component.
//
// Scenario 3 → WORKS if `data` is serializable. Server fetches data, passes plain
//   object/array as props to Client Component. This is the standard pattern.

function solution10(): void {
  console.log("Scenario 1: WORKS (children pattern)");
  console.log("Scenario 2: DOES NOT WORK (import makes it client code)");
  console.log("Scenario 3: WORKS (serializable data as props)");
}

// ─── Exercise 11 ────────────────────────────────────────────────────────────
function solution11(tree: TreeNode): ValidationError[] {
  const errors: ValidationError[] = [];

  function validate(node: TreeNode, parentType: ComponentType | null) {
    // Check if non-serializable props are passed from server to client
    if (parentType === 'server' && node.type === 'client' && node.propsFromParent) {
      for (const prop of node.propsFromParent) {
        if (prop.startsWith('on') || prop.includes('handler') || prop.includes('callback')) {
          errors.push({
            component: node.name,
            error: `Non-serializable prop "${prop}" (function) passed from server`,
          });
        }
      }
    }

    for (const child of node.children) {
      validate(child, node.type);
    }
  }

  validate(tree, null);
  return errors;
}

// ─── Exercise 12 ────────────────────────────────────────────────────────────
function solution12(
  components: ComponentRequirements[]
): { clientBoundaries: string[]; totalClientKB: number; totalServerKB: number } {
  const compMap = new Map(components.map(c => [c.name, c]));
  const clientBoundaries: string[] = [];
  let totalClientKB = 0;
  let totalServerKB = 0;

  // Find components that need interactivity — these must be client
  for (const comp of components) {
    if (comp.needsInteractivity) {
      clientBoundaries.push(comp.name);
      totalClientKB += comp.estimatedSize;
    } else {
      totalServerKB += comp.estimatedSize;
    }
  }

  return { clientBoundaries, totalClientKB, totalServerKB };
}

// ─── Exercise 13 ────────────────────────────────────────────────────────────
function solution13(
  steps: DataFlowStep[]
): Array<{ step: number; valid: boolean; reason: string }> {
  return steps.map((step, i) => {
    switch (step.mechanism) {
      case 'props':
        if (step.direction === 'client→server') {
          return { step: i + 1, valid: false, reason: 'Props flow server→client only' };
        }
        return { step: i + 1, valid: true, reason: 'Props can carry serializable data server→client' };
      case 'server-action':
        if (step.direction === 'server→client') {
          return { step: i + 1, valid: false, reason: 'Server Actions receive data from client→server' };
        }
        return { step: i + 1, valid: true, reason: 'Server Actions handle client→server data flow' };
      case 'api-route':
        if (step.direction === 'server→client') {
          return { step: i + 1, valid: false, reason: 'API routes are called client→server' };
        }
        return { step: i + 1, valid: true, reason: 'API routes handle client→server requests' };
      case 'children':
        if (step.direction === 'client→server') {
          return { step: i + 1, valid: false, reason: 'Children pattern flows server→client' };
        }
        return { step: i + 1, valid: true, reason: 'React elements passed as children' };
      case 'url-params':
        return { step: i + 1, valid: true, reason: 'URL params work in both directions' };
      default:
        return { step: i + 1, valid: false, reason: 'Unknown mechanism' };
    }
  });
}

// ─── Exercise 14 ────────────────────────────────────────────────────────────
function solution14(component: MixedComponent): {
  serverComponent: { name: string; features: string[] };
  clientComponent: { name: string; features: string[] };
  pattern: string;
} {
  const serverFeatures = component.features
    .filter(f => f.needsServer || (!f.needsServer && !f.needsClient))
    .map(f => f.description);

  const clientFeatures = component.features
    .filter(f => f.needsClient)
    .map(f => f.description);

  return {
    serverComponent: { name: component.name, features: serverFeatures },
    clientComponent: { name: `${component.name}Client`, features: clientFeatures },
    pattern: clientFeatures.length > 0 ? 'Server wrapper with client islands' : 'Pure server component',
  };
}

// ─── Exercise 15 ────────────────────────────────────────────────────────────
function solution15(root: SimComponent): RenderResult[] {
  const results: RenderResult[] = [];

  function walk(node: SimComponent, parentType: ComponentType | null) {
    const errors: string[] = [];

    // Check prop serialization at server→client boundary
    if (parentType === 'server' && node.type === 'client') {
      for (const [propName, propInfo] of Object.entries(node.props)) {
        if (!propInfo.serializable) {
          errors.push(`Non-serializable prop "${propName}" (${propInfo.type})`);
        }
      }
    }

    results.push({
      component: node.name,
      renderedOn: node.type === 'server' ? 'server' : 'both',
      propsReceived: Object.keys(node.props),
      errors,
    });

    for (const child of node.children) {
      walk(child, node.type);
    }
  }

  walk(root, null);
  return results;
}

// ─── Runner ─────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== Exercise 1: Component Type Identification ===");
  solution1();

  console.log("\n=== Exercise 2: Component Classifier ===");
  console.log(solution2({ name: 'Counter', type: 'server', imports: ['react'], usesHooks: ['useState'], usesEvents: ['onClick'], children: [] }));

  console.log("\n=== Exercise 3: Boundary Propagation ===");
  solution3();

  console.log("\n=== Exercise 4: Import Graph Analysis ===");
  console.log(JSON.stringify(solution4({
    'page.tsx': { directive: null, imports: ['ClientWrapper'] },
    'ClientWrapper': { directive: '"use client"', imports: ['Helper'] },
    'Helper': { directive: null, imports: [] },
  }, 'page.tsx'), null, 2));

  console.log("\n=== Exercise 5: Serialization ===");
  solution5();

  console.log("\n=== Exercise 6: Serialization Checker ===");
  console.log(solution6('string'));
  console.log(solution6('function'));
  console.log(solution6('server-action'));

  console.log("\n=== Exercise 7: Render Phases ===");
  solution7();

  console.log("\n=== Exercise 8: Phase Calculator ===");
  console.log(solution8([
    { name: 'Layout', type: 'server' },
    { name: 'Counter', type: 'client' },
    { name: 'Footer', type: 'server' },
  ]));

  console.log("\n=== Exercise 9: Bundle Analysis ===");
  console.log(solution9([
    { name: 'Page', type: 'server', imports: ['db', 'fs'], usesHooks: [], usesEvents: [], children: ['Counter'] },
    { name: 'Counter', type: 'client', imports: ['react'], usesHooks: ['useState'], usesEvents: ['onClick'] },
  ]));

  console.log("\n=== Exercise 10: Children Pattern ===");
  solution10();

  console.log("\n=== Exercise 11: Tree Validator ===");
  console.log(solution11({
    name: 'Page', type: 'server', children: [
      { name: 'Counter', type: 'client', children: [], propsFromParent: ['count', 'onIncrement'] },
    ]
  }));

  console.log("\n=== Exercise 12: Optimal Boundaries ===");
  console.log(solution12([
    { name: 'Page', needsInteractivity: false, estimatedSize: 50, children: ['Header', 'Content', 'Footer'] },
    { name: 'Header', needsInteractivity: false, estimatedSize: 10, children: ['SearchBar'] },
    { name: 'SearchBar', needsInteractivity: true, estimatedSize: 5, children: [] },
    { name: 'Content', needsInteractivity: false, estimatedSize: 30, children: [] },
    { name: 'Footer', needsInteractivity: false, estimatedSize: 5, children: [] },
  ]));

  console.log("\n=== Exercise 13: Data Flow Validation ===");
  console.log(solution13([
    { from: 'Server', to: 'Client', data: 'product', mechanism: 'props', direction: 'server→client' },
    { from: 'Client', to: 'Server', data: 'formData', mechanism: 'server-action', direction: 'client→server' },
  ]));

  console.log("\n=== Exercise 14: Refactoring Advisor ===");
  console.log(JSON.stringify(solution14({
    name: 'ProductPage',
    features: [
      { description: 'Fetch product from DB', needsServer: true, needsClient: false },
      { description: 'Display product info', needsServer: false, needsClient: false },
      { description: 'Add to cart button', needsServer: false, needsClient: true },
      { description: 'Image gallery with zoom', needsServer: false, needsClient: true },
    ],
  }), null, 2));

  console.log("\n=== Exercise 15: Full Tree Render ===");
  console.log(JSON.stringify(solution15({
    name: 'Page', type: 'server', props: {},
    children: [{
      name: 'Counter', type: 'client',
      props: { count: { type: 'number', serializable: true }, onClick: { type: 'function', serializable: false } },
      children: [],
    }],
  }), null, 2));
}

main().catch(console.error);
