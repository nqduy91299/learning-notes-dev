// ============================================================================
// 01-dom-manipulation: Solutions
// ============================================================================
// Compare these with your answers in exercises.ts.
// Each solution includes an explanation referencing the README concepts.
// ============================================================================

type NodeType = "element" | "text" | "comment";

interface SimpleNodeInit {
  tag?: string;
  text?: string;
  type?: NodeType;
  id?: string;
  classes?: string[];
  attributes?: Record<string, string>;
}

// ─── Exercise 1: SimpleNode class ───────────────────────────────────────────

class SimpleNode {
  nodeType: NodeType;
  tagName: string;
  id: string;
  parent: SimpleNode | null;
  #children: SimpleNode[];
  #text: string;
  #classes: string[];
  #attributes: Record<string, string>;

  constructor(init: SimpleNodeInit = {}) {
    this.nodeType = init.type ?? "element";
    this.tagName = this.nodeType === "element" ? (init.tag ?? "div").toUpperCase() : "";
    this.id = init.id ?? "";
    this.parent = null;
    this.#children = [];
    this.#text = init.text ?? "";
    this.#classes = [...(init.classes ?? [])];
    this.#attributes = { ...(init.attributes ?? {}) };
  }

  get children(): SimpleNode[] { return [...this.#children]; }

  get textContent(): string {
    if (this.nodeType === "text" || this.nodeType === "comment") return this.#text;
    return this.#children.map(c => c.textContent).join("");
  }

  set textContent(value: string) {
    if (this.nodeType === "text" || this.nodeType === "comment") {
      this.#text = value;
    } else {
      for (const c of [...this.#children]) c.parent = null;
      this.#children = [];
      if (value !== "") this.appendChild(new SimpleNode({ type: "text", text: value }));
    }
  }

  appendChild(child: SimpleNode): SimpleNode {
    if (child.parent) child.parent.removeChild(child);
    this.#children.push(child);
    child.parent = this;
    return child;
  }

  removeChild(child: SimpleNode): SimpleNode {
    const idx = this.#children.indexOf(child);
    if (idx === -1) throw new Error("Node is not a child of this node");
    this.#children.splice(idx, 1);
    child.parent = null;
    return child;
  }

  querySelector(sel: string): SimpleNode | null {
    for (const child of this.#children) {
      if (this.#matches(child, sel)) return child;
      const found = child.querySelector(sel);
      if (found) return found;
    }
    return null;
  }

  querySelectorAll(sel: string): SimpleNode[] {
    const r: SimpleNode[] = [];
    this.#collectAll(sel, r);
    return r;
  }

  #collectAll(sel: string, r: SimpleNode[]): void {
    for (const child of this.#children) {
      if (this.#matches(child, sel)) r.push(child);
      child.#collectAll(sel, r);
    }
  }

  #matches(n: SimpleNode, s: string): boolean {
    if (n.nodeType !== "element") return false;
    if (s.startsWith("#")) return n.id === s.slice(1);
    if (s.startsWith(".")) return n.#classes.includes(s.slice(1));
    return n.tagName === s.toUpperCase();
  }

  getClasses(): string[] { return [...this.#classes]; }
  setClasses(c: string[]): void { this.#classes = [...c]; }
  getRawAttributes(): Record<string, string> { return { ...this.#attributes }; }
  setRawAttributes(a: Record<string, string>): void { this.#attributes = { ...a }; }
  hasClass(cls: string): boolean { return this.#classes.includes(cls); }
  getRawText(): string { return this.#text; }
  getChildrenRef(): SimpleNode[] { return this.#children; }
}

// Explanation: SimpleNode models a DOM node. appendChild/removeChild manage
// parent-child links. querySelector does depth-first search on descendants
// only (not self). textContent for elements recursively joins descendant text.
// See README → Sections 1-6.

// ─── Exercise 2: Walking the DOM ────────────────────────────────────────────

function solution2() {
  const container = new SimpleNode({ tag: "div", id: "container" });
  const h1 = new SimpleNode({ tag: "h1" });
  h1.appendChild(new SimpleNode({ type: "text", text: "Title" }));
  const p1 = new SimpleNode({ tag: "p" });
  p1.appendChild(new SimpleNode({ type: "text", text: "Para 1" }));
  const p2 = new SimpleNode({ tag: "p" });
  p2.appendChild(new SimpleNode({ type: "text", text: "Para 2" }));
  container.appendChild(h1);
  container.appendChild(p1);
  container.appendChild(p2);

  console.log(container.children.length);     // 3
  console.log(container.children[0].tagName); // "H1"
  console.log(p1.parent?.id);                 // "container"
  console.log(container.textContent);         // "TitlePara 1Para 2"
}
// ANSWER: 3, "H1", "container", "TitlePara 1Para 2"
// See README → Sections 3-4.

// ─── Exercise 3: innerHTML vs textContent ───────────────────────────────────

function solution3() {
  console.log("Q1:", "<p>Hello <b>World</b></p>");
  console.log("Q2:", "Hello World");
  console.log("Q3:", "&lt;b&gt;Bold?&lt;/b&gt;");
  console.log("Q4:", "<b>Bold?</b>");
}
// ANSWER: innerHTML returns HTML markup; textContent returns stripped text.
// Setting textContent escapes HTML — safe against XSS.
// See README → Section 9.

// ─── Exercise 4: querySelector vs querySelectorAll ──────────────────────────

function solution4() {
  console.log("Q1:", "First");   // querySelector returns first match
  console.log("Q2:", 3);         // all 3 li have .item
  console.log("Q3:", 2);         // First and Third have .item.active
  console.log("Q4:", "Third");   // :last-child is Third
}
// See README → Section 6.

// ─── Exercise 5: Live vs static collections ─────────────────────────────────

function solution5() {
  // live updates with DOM changes; static is a snapshot
  const a = [2, 2, 3, 2, 2, 2];
  a.forEach((v, i) => console.log(`Q${i + 1}: ${v}`));
}
// ANSWER: Q1:2 Q2:2 Q3:3(live+1) Q4:2(static) Q5:2(live-1) Q6:2(static)
// See README → Section 7.

// ─── Exercise 6: element.style vs getComputedStyle ──────────────────────────

function solution6() {
  console.log("Q1:", "");               // style.color — not set inline
  console.log("Q2:", "14px");           // style.fontSize — set inline
  console.log("Q3:", "rgb(255, 0, 0)"); // computed color from stylesheet
  console.log("Q4:", "14px");           // inline 14px overrides stylesheet 20px
}
// element.style only reads inline styles. getComputedStyle reads final values.
// See README → Section 17.

// ─── Exercise 7: matches/closest/contains ───────────────────────────────────

function solution7() {
  const a = [true, "UL", "first", true, false];
  a.forEach((v, i) => console.log(`Q${i + 1}: ${v}`));
}
// matches tests element against selector. closest walks UP from self.
// contains checks descendant relationship.
// See README → Section 8.

// ─── Exercise 8: classList ──────────────────────────────────────────────────

class ClassList {
  #node: SimpleNode;
  constructor(node: SimpleNode) { this.#node = node; }

  add(...classes: string[]): void {
    const cur = this.#node.getClasses();
    for (const c of classes) if (!cur.includes(c)) cur.push(c);
    this.#node.setClasses(cur);
  }

  remove(...classes: string[]): void {
    this.#node.setClasses(this.#node.getClasses().filter(c => !classes.includes(c)));
  }

  toggle(cls: string, force?: boolean): boolean {
    const has = this.contains(cls);
    if (force !== undefined) {
      force ? this.add(cls) : this.remove(cls);
      return force;
    }
    has ? this.remove(cls) : this.add(cls);
    return !has;
  }

  contains(cls: string): boolean { return this.#node.getClasses().includes(cls); }

  replace(oldC: string, newC: string): boolean {
    const cur = this.#node.getClasses();
    const idx = cur.indexOf(oldC);
    if (idx === -1) return false;
    cur[idx] = newC;
    this.#node.setClasses(cur);
    return true;
  }

  get length(): number { return this.#node.getClasses().length; }
  toString(): string { return this.#node.getClasses().join(" "); }
}
// See README → Section 16.

// ─── Exercise 9: AttributeMap ───────────────────────────────────────────────

class AttributeMap {
  #node: SimpleNode;
  constructor(node: SimpleNode) { this.#node = node; }

  getAttribute(name: string): string | null {
    const a = this.#node.getRawAttributes();
    return name in a ? a[name] : null;
  }

  setAttribute(name: string, value: string): void {
    const a = this.#node.getRawAttributes();
    a[name] = value;
    this.#node.setRawAttributes(a);
    if (name === "id") this.#node.id = value;
    else if (name === "class") this.#node.setClasses(value.split(/\s+/).filter(Boolean));
  }

  removeAttribute(name: string): void {
    const a = this.#node.getRawAttributes();
    delete a[name];
    this.#node.setRawAttributes(a);
    if (name === "id") this.#node.id = "";
    else if (name === "class") this.#node.setClasses([]);
  }

  hasAttribute(name: string): boolean { return name in this.#node.getRawAttributes(); }
}
// Syncs "id"↔node.id and "class"↔node classes.
// See README → Section 15.

// ─── Exercise 10: insertAdjacent ────────────────────────────────────────────

type Position = "beforebegin" | "afterbegin" | "beforeend" | "afterend";

function insertAdjacent(pos: Position, node: SimpleNode, target: SimpleNode): void {
  switch (pos) {
    case "beforebegin": {
      if (!target.parent) throw new Error("No parent for beforebegin");
      const ch = target.parent.getChildrenRef();
      node.parent = target.parent;
      ch.splice(ch.indexOf(target), 0, node);
      break;
    }
    case "afterbegin": {
      node.parent = target;
      target.getChildrenRef().unshift(node);
      break;
    }
    case "beforeend": {
      target.appendChild(node);
      break;
    }
    case "afterend": {
      if (!target.parent) throw new Error("No parent for afterend");
      const ch = target.parent.getChildrenRef();
      node.parent = target.parent;
      ch.splice(ch.indexOf(target) + 1, 0, node);
      break;
    }
  }
}
// See README → Section 12.

// ─── Exercise 11: Fix removeAllWithClass ────────────────────────────────────

function solution11() {
  function removeAllWithClass(parent: SimpleNode, cls: string): void {
    // FIX: collect first, then remove (avoids index shifting)
    const toRemove = parent.children.filter(c => c.hasClass(cls));
    for (const child of toRemove) parent.removeChild(child);
  }

  const c = new SimpleNode({ tag: "div" });
  c.appendChild(new SimpleNode({ tag: "p", classes: ["remove"] }));
  c.appendChild(new SimpleNode({ tag: "p", classes: ["keep"] }));
  c.appendChild(new SimpleNode({ tag: "p", classes: ["remove"] }));
  c.appendChild(new SimpleNode({ tag: "p", classes: ["remove"] }));
  c.appendChild(new SimpleNode({ tag: "p", classes: ["keep"] }));
  removeAllWithClass(c, "remove");
  console.log(c.children.length);                             // 2
  console.log(c.children.every(ch => !ch.hasClass("remove"))); // true
}
// Bug: forward iteration + removal shifts indices, skipping elements.
// Fix: snapshot matching nodes, then remove. See README → Section 13.

// ─── Exercise 12: Fix querySelector self-match ──────────────────────────────

function solution12() {
  function fixedQS(node: SimpleNode, sel: string): SimpleNode | null {
    // FIX: iterate children directly — don't check self
    for (const child of node.getChildrenRef()) {
      if (matchesSel(child, sel)) return child;
      const found = fixedQS(child, sel);
      if (found) return found;
    }
    return null;
  }
  function matchesSel(n: SimpleNode, s: string): boolean {
    if (n.nodeType !== "element") return false;
    if (s.startsWith("#")) return n.id === s.slice(1);
    if (s.startsWith(".")) return n.hasClass(s.slice(1));
    return n.tagName === s.toUpperCase();
  }

  const div = new SimpleNode({ tag: "div", id: "root", classes: ["container"] });
  div.appendChild(new SimpleNode({ tag: "div", id: "inner" }));
  console.log(fixedQS(div, "#root"));         // null (self not matched)
  console.log(fixedQS(div, ".container"));     // null
  console.log(fixedQS(div, "div")?.id);        // "inner"
}
// querySelector searches descendants, not self. See README → Section 6.

// ─── Exercise 13: Fix textContent setter ────────────────────────────────────

function solution13() {
  class FixedNode {
    #children: SimpleNode[] = [];
    nodeType: NodeType = "element";
    tagName: string;
    constructor(tag: string) { this.tagName = tag.toUpperCase(); }
    appendChild(child: SimpleNode): void { this.#children.push(child); }
    get children(): SimpleNode[] { return [...this.#children]; }
    get textContent(): string {
      return this.#children.filter(c => c.nodeType === "text").map(c => c.getRawText()).join("");
    }
    // FIX: clear children first
    set textContent(value: string) {
      this.#children = [];
      this.appendChild(new SimpleNode({ type: "text", text: value }));
    }
  }
  const node = new FixedNode("div");
  node.appendChild(new SimpleNode({ tag: "p" }));
  node.appendChild(new SimpleNode({ type: "text", text: "old" }));
  node.textContent = "new content";
  console.log(node.children.length); // 1
  console.log(node.textContent);     // "new content"
}
// Setting textContent must remove ALL children first. See README → Section 9.

// ─── Exercise 14: cloneNode ─────────────────────────────────────────────────

function cloneNode(node: SimpleNode, deep: boolean = false): SimpleNode {
  const clone = new SimpleNode({
    type: node.nodeType,
    tag: node.tagName.toLowerCase() || undefined,
    text: node.getRawText(),
    id: node.id,
    classes: node.getClasses(),
    attributes: node.getRawAttributes(),
  });
  if (deep) {
    for (const child of node.children) clone.appendChild(cloneNode(child, true));
  }
  return clone;
}
// Shallow: no children. Deep: recursive. Clone parent=null, independent.
// See README → Section 14.

// ─── Exercise 15: Template renderer ─────────────────────────────────────────

interface Template {
  tag: string;
  id?: string;
  classes?: string[];
  attributes?: Record<string, string>;
  children?: (Template | string)[];
}

function renderTemplate(tpl: Template): SimpleNode {
  const node = new SimpleNode({
    tag: tpl.tag, id: tpl.id, classes: tpl.classes, attributes: tpl.attributes,
  });
  if (tpl.children) {
    for (const child of tpl.children) {
      if (typeof child === "string") {
        node.appendChild(new SimpleNode({ type: "text", text: child }));
      } else {
        node.appendChild(renderTemplate(child));
      }
    }
  }
  return node;
}
// Recursively builds a SimpleNode tree from a template. Strings → text nodes.
// See README → Sections 10-11.

// ─── Exercise 16: Sibling navigation ────────────────────────────────────────

function previousSibling(node: SimpleNode): SimpleNode | null {
  if (!node.parent) return null;
  const s = node.parent.getChildrenRef();
  const i = s.indexOf(node);
  return i > 0 ? s[i - 1] : null;
}

function nextSibling(node: SimpleNode): SimpleNode | null {
  if (!node.parent) return null;
  const s = node.parent.getChildrenRef();
  const i = s.indexOf(node);
  return i < s.length - 1 ? s[i + 1] : null;
}

function nextElementSibling(node: SimpleNode): SimpleNode | null {
  if (!node.parent) return null;
  const s = node.parent.getChildrenRef();
  for (let i = s.indexOf(node) + 1; i < s.length; i++) {
    if (s[i].nodeType === "element") return s[i];
  }
  return null;
}
// nextSibling returns any node type; nextElementSibling skips text/comment.
// See README → Sections 3-4.

// ─── Exercise 17: DatasetProxy ──────────────────────────────────────────────

class DatasetProxy {
  #node: SimpleNode;
  constructor(node: SimpleNode) { this.#node = node; }

  #toAttr(prop: string): string {
    return "data-" + prop.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
  }

  get(prop: string): string | undefined {
    const a = this.#node.getRawAttributes();
    const name = this.#toAttr(prop);
    return name in a ? a[name] : undefined;
  }

  set(prop: string, value: string): void {
    const a = this.#node.getRawAttributes();
    a[this.#toAttr(prop)] = value;
    this.#node.setRawAttributes(a);
  }

  delete(prop: string): boolean {
    const a = this.#node.getRawAttributes();
    const name = this.#toAttr(prop);
    if (!(name in a)) return false;
    delete a[name];
    this.#node.setRawAttributes(a);
    return true;
  }
}
// Converts camelCase to data-kebab-case. See README → Section 15.

// ─── Exercise 18: DOM tree diff ─────────────────────────────────────────────

interface DiffResult {
  type: "added" | "removed" | "changed";
  path: string;
  details: string;
}

function diffTrees(
  oldTree: SimpleNode | null,
  newTree: SimpleNode | null,
  path: string = "root"
): DiffResult[] {
  const results: DiffResult[] = [];
  if (!oldTree && !newTree) return results;

  const desc = (n: SimpleNode) =>
    n.nodeType === "element" ? `${n.tagName}${n.id ? "#" + n.id : ""}` : `[${n.nodeType}]`;

  if (!oldTree && newTree) { results.push({ type: "added", path, details: desc(newTree) }); return results; }
  if (oldTree && !newTree) { results.push({ type: "removed", path, details: desc(oldTree) }); return results; }

  const o = oldTree!, n = newTree!;
  if (o.nodeType === "element" && n.nodeType === "element") {
    const ch: string[] = [];
    if (o.tagName !== n.tagName) ch.push(`tagName: ${o.tagName} → ${n.tagName}`);
    if (o.id !== n.id) ch.push(`id: ${o.id || "(none)"} → ${n.id || "(none)"}`);
    const oc = o.getClasses().sort().join(","), nc = n.getClasses().sort().join(",");
    if (oc !== nc) ch.push(`classes: [${oc}] → [${nc}]`);
    if (ch.length) results.push({ type: "changed", path, details: ch.join("; ") });
  }

  const oCh = o.children, nCh = n.children;
  for (let i = 0; i < Math.max(oCh.length, nCh.length); i++) {
    results.push(...diffTrees(
      i < oCh.length ? oCh[i] : null,
      i < nCh.length ? nCh[i] : null,
      `${path} > ${i}`
    ));
  }
  return results;
}
// Position-based diff. Compares tagName/id/classes, recurses children by index.

// ============================================================================
// Run all solutions
// ============================================================================

console.log("=== Ex 1: SimpleNode ===");
const r1 = new SimpleNode({ tag: "div", id: "root" });
const p1e = new SimpleNode({ tag: "p" });
p1e.appendChild(new SimpleNode({ type: "text", text: "Hello" }));
r1.appendChild(p1e);
console.log(r1.textContent);
console.log(r1.querySelector("p")?.tagName);
console.log(r1.querySelector("#root"));

console.log("\n=== Ex 2: Walking the DOM ===");
solution2();

console.log("\n=== Ex 3: innerHTML vs textContent ===");
solution3();

console.log("\n=== Ex 4: querySelector vs querySelectorAll ===");
solution4();

console.log("\n=== Ex 5: Live vs static ===");
solution5();

console.log("\n=== Ex 6: style vs getComputedStyle ===");
solution6();

console.log("\n=== Ex 7: matches/closest/contains ===");
solution7();

console.log("\n=== Ex 8: classList ===");
const el8 = new SimpleNode({ tag: "div", classes: ["alert"] });
const cl8 = new ClassList(el8);
cl8.add("warning", "bold");
console.log(cl8.toString());
console.log(cl8.contains("warning"));
cl8.remove("alert");
console.log(cl8.toString());
console.log(cl8.toggle("bold"));
console.log(cl8.toString());
console.log(cl8.toggle("active"));
console.log(cl8.toString());
console.log(cl8.replace("warning", "notice"));
console.log(cl8.toString());
console.log(cl8.length);

console.log("\n=== Ex 9: AttributeMap ===");
const el9 = new SimpleNode({ tag: "div" });
const at9 = new AttributeMap(el9);
at9.setAttribute("id", "main");
console.log(el9.id);
console.log(at9.getAttribute("id"));
at9.setAttribute("class", "foo bar");
console.log(el9.getClasses());
at9.setAttribute("data-role", "admin");
console.log(at9.getAttribute("data-role"));
console.log(at9.hasAttribute("data-role"));
at9.removeAttribute("id");
console.log(el9.id);
console.log(at9.hasAttribute("id"));

console.log("\n=== Ex 10: insertAdjacent ===");
const p10 = new SimpleNode({ tag: "div", id: "parent" });
const c10a = new SimpleNode({ tag: "p", id: "first" });
const c10b = new SimpleNode({ tag: "p", id: "second" });
p10.appendChild(c10a); p10.appendChild(c10b);
insertAdjacent("beforebegin", new SimpleNode({ tag: "span", id: "bf" }), c10a);
console.log(p10.children.map(c => c.id));
insertAdjacent("afterbegin", new SimpleNode({ tag: "span", id: "ab" }), p10);
console.log(p10.children.map(c => c.id));
insertAdjacent("beforeend", new SimpleNode({ tag: "span", id: "be" }), p10);
console.log(p10.children.map(c => c.id));
insertAdjacent("afterend", new SimpleNode({ tag: "span", id: "as" }), c10b);
console.log(p10.children.map(c => c.id));

console.log("\n=== Ex 11: Fix removeAllWithClass ===");
solution11();

console.log("\n=== Ex 12: Fix querySelector self-match ===");
solution12();

console.log("\n=== Ex 13: Fix textContent setter ===");
solution13();

console.log("\n=== Ex 14: cloneNode ===");
const orig14 = new SimpleNode({ tag: "div", id: "original", classes: ["a", "b"] });
orig14.appendChild(new SimpleNode({ tag: "p", id: "child" }));
orig14.children[0].appendChild(new SimpleNode({ type: "text", text: "Hello" }));
// Need to re-append since children returns copy
const pNode = orig14.querySelector("p")!;
pNode.appendChild(new SimpleNode({ type: "text", text: "Hello" }));

const s14 = cloneNode(orig14, false);
console.log(s14.tagName, s14.id, s14.getClasses(), s14.children.length, s14.parent);
const d14 = cloneNode(orig14, true);
console.log(d14.children.length, d14.children[0].id);
console.log(d14.children[0].parent === d14);
d14.id = "cloned";
console.log(orig14.id);

console.log("\n=== Ex 15: Template renderer ===");
const tpl: Template = {
  tag: "div", id: "app", classes: ["container"],
  children: [
    { tag: "h1", children: ["Welcome"] },
    { tag: "ul", children: [
      { tag: "li", classes: ["item"], children: ["Item 1"] },
      { tag: "li", classes: ["item"], children: ["Item 2"] },
    ]},
  ],
};
const r15 = renderTemplate(tpl);
console.log(r15.tagName, r15.id, r15.children.length);
console.log(r15.querySelector("h1")?.textContent);
console.log(r15.querySelectorAll("li").length);
console.log(r15.querySelector(".item")?.textContent);
console.log(r15.textContent);

console.log("\n=== Ex 16: Sibling navigation ===");
const p16 = new SimpleNode({ tag: "div" });
const a16 = new SimpleNode({ tag: "span", id: "a" });
const t16 = new SimpleNode({ type: "text", text: " " });
const b16 = new SimpleNode({ tag: "span", id: "b" });
p16.appendChild(a16); p16.appendChild(t16); p16.appendChild(b16);
console.log(previousSibling(a16));
console.log(nextSibling(a16)?.nodeType);
console.log(nextSibling(t16)?.id);
console.log(previousSibling(b16)?.nodeType);
console.log(nextElementSibling(a16)?.id);
console.log(nextElementSibling(b16));

console.log("\n=== Ex 17: DatasetProxy ===");
const el17 = new SimpleNode({ tag: "div", attributes: { "data-user-id": "42", "data-role": "admin" } });
const ds17 = new DatasetProxy(el17);
console.log(ds17.get("userId"));
console.log(ds17.get("role"));
ds17.set("active", "true");
console.log(ds17.get("active"));
console.log(el17.getRawAttributes()["data-active"]);
ds17.delete("role");
console.log(ds17.get("role"));

console.log("\n=== Ex 18: DOM tree diff ===");
const old18 = new SimpleNode({ tag: "div", id: "root" });
old18.appendChild(new SimpleNode({ tag: "p", id: "a" }));
old18.appendChild(new SimpleNode({ tag: "span", id: "b" }));
const new18 = new SimpleNode({ tag: "div", id: "root" });
new18.appendChild(new SimpleNode({ tag: "p", id: "a" }));
new18.appendChild(new SimpleNode({ tag: "div", id: "b" }));
new18.appendChild(new SimpleNode({ tag: "p", id: "c" }));
diffTrees(old18, new18).forEach(d => console.log(`${d.type} at ${d.path}: ${d.details}`));
