// ============================================================================
// 01-dom-manipulation: Exercises
// ============================================================================
// Run:  npx tsx 01-javascript/05-dom-and-events/01-dom-manipulation/exercises.ts
//
// NOTE: These exercises run in Node.js, not a browser.
// DOM concepts are tested via simulated structures and knowledge questions.
//
// Instructions:
//   - "Predict the output"  → fill in YOUR ANSWER below the question
//   - "Fix the bug"         → edit the code so it works correctly
//   - "Implement"           → write the function/class body
//
// When you're done, check your answers against solutions.ts
// ============================================================================

// ────────────────────────────────────────────────────────────────────────────
// Shared: SimpleNode — a simulated DOM node
// ────────────────────────────────────────────────────────────────────────────

type NodeType = "element" | "text" | "comment";

interface SimpleNodeInit {
  tag?: string;
  text?: string;
  type?: NodeType;
  id?: string;
  classes?: string[];
  attributes?: Record<string, string>;
}

// ─── Exercise 1: Implement ──────────────────────────────────────────────────
// Topic: SimpleNode class — simulating a DOM tree
//
// Implement a SimpleNode that models a basic DOM node:
//   - nodeType, tagName (uppercase for elements), id, parent (SimpleNode|null)
//   - children getter: returns a copy of the children array
//   - textContent getter: text/comment → their text; element → concatenated
//     descendant text (recursive)
//   - textContent setter: text/comment → set text; element → clear children,
//     add one text node
//   - appendChild(child): append, set parent, return child
//   - removeChild(child): remove, clear parent, return child (throw if not found)
//   - querySelector(sel): depth-first descendants only (not self).
//     Simple selectors: "tag", "#id", ".class"
//   - querySelectorAll(sel): all matches among descendants

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

  get children(): SimpleNode[] { return []; /* YOUR CODE */ }

  get textContent(): string { return ""; /* YOUR CODE */ }
  set textContent(_value: string) { /* YOUR CODE */ }

  appendChild(_child: SimpleNode): SimpleNode { return _child; /* YOUR CODE */ }
  removeChild(_child: SimpleNode): SimpleNode { return _child; /* YOUR CODE */ }
  querySelector(_sel: string): SimpleNode | null { return null; /* YOUR CODE */ }
  querySelectorAll(_sel: string): SimpleNode[] { return []; /* YOUR CODE */ }

  // Helpers for classList/attributes exercises
  getClasses(): string[] { return [...this.#classes]; }
  setClasses(c: string[]): void { this.#classes = [...c]; }
  getRawAttributes(): Record<string, string> { return { ...this.#attributes }; }
  setRawAttributes(a: Record<string, string>): void { this.#attributes = { ...a }; }
  hasClass(cls: string): boolean { return this.#classes.includes(cls); }
  getRawText(): string { return this.#text; }
  getChildrenRef(): SimpleNode[] { return this.#children; }
}

// Uncomment to test:
// const root = new SimpleNode({ tag: "div", id: "root" });
// const p = new SimpleNode({ tag: "p" });
// p.appendChild(new SimpleNode({ type: "text", text: "Hello" }));
// root.appendChild(p);
// console.log(root.textContent);              // "Hello"
// console.log(root.querySelector("p")?.tagName); // "P"

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: Walking the DOM — parent, children, textContent
//
// Structure: <div#container> → <h1>"Title"</h1>, <p>"Para 1"</p>, <p>"Para 2"</p>

function exercise2() {
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

  console.log(container.children.length);     // Q1: ???
  console.log(container.children[0].tagName); // Q2: ???
  console.log(p1.parent?.id);                 // Q3: ???
  console.log(container.textContent);         // Q4: ???
}
// Uncomment to test:
// exercise2();

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: innerHTML vs textContent (browser knowledge)
//
// Given: <div id="box"><p>Hello <b>World</b></p></div>
// Q1: box.innerHTML → ???
// Q2: box.textContent → ???
// Q3: After box.textContent = "<b>Bold?</b>", box.innerHTML → ???
// Q4: After that, box.textContent → ???

function exercise3() {
  const q1 = "???"; const q2 = "???"; const q3 = "???"; const q4 = "???";
  console.log("Q1:", q1, "Q2:", q2, "Q3:", q3, "Q4:", q4);
}
// Uncomment to test:
// exercise3();

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: querySelector vs querySelectorAll (browser knowledge)
//
// Given: <ul#list> <li.item.active>First</li> <li.item>Second</li> <li.item.active>Third</li>
// Q1: document.querySelector(".item").textContent → ???
// Q2: document.querySelectorAll(".item").length → ???
// Q3: document.querySelectorAll(".item.active").length → ???
// Q4: document.querySelector("#list .item:last-child").textContent → ???

function exercise4() {
  const q1 = "???"; const q2 = "???"; const q3 = "???"; const q4 = "???";
  console.log("Q1:", q1, "Q2:", q2, "Q3:", q3, "Q4:", q4);
}
// Uncomment to test:
// exercise4();

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: Live vs static collections (browser knowledge)
//
// HTML: <div.box>A</div> <div.box>B</div>
// const live = document.getElementsByClassName("box");  // live
// const snap = document.querySelectorAll(".box");        // static
// Q1: live.length → ???    Q2: snap.length → ???
// After appending a new <div.box>:
// Q3: live.length → ???    Q4: snap.length → ???
// After removing first .box:
// Q5: live.length → ???    Q6: snap.length → ???

function exercise5() {
  const a = ["???", "???", "???", "???", "???", "???"];
  a.forEach((v, i) => console.log(`Q${i + 1}: ${v}`));
}
// Uncomment to test:
// exercise5();

// ─── Exercise 6: Predict the Output ─────────────────────────────────────────
// Topic: element.style vs getComputedStyle (browser knowledge)
//
// CSS: .box { color: red; font-size: 20px; }
// HTML: <div class="box" style="font-size: 14px;">Hello</div>
// Q1: box.style.color → ???
// Q2: box.style.fontSize → ???
// Q3: getComputedStyle(box).color → ???
// Q4: getComputedStyle(box).fontSize → ???

function exercise6() {
  const q1 = "???"; const q2 = "???"; const q3 = "???"; const q4 = "???";
  console.log("Q1:", q1, "Q2:", q2, "Q3:", q3, "Q4:", q4);
}
// Uncomment to test:
// exercise6();

// ─── Exercise 7: Predict the Output ─────────────────────────────────────────
// Topic: matches(), closest(), contains() (browser knowledge)
//
// HTML: <div#outer.container> <ul.list> <li.item.active#first>One</li> </ul> </div>
// const first = document.getElementById("first");
// Q1: first.matches(".item.active") → ???
// Q2: first.closest(".list").tagName → ???
// Q3: first.closest("li").id → ???
// Q4: document.getElementById("outer").contains(first) → ???
// Q5: first.contains(document.getElementById("outer")) → ???

function exercise7() {
  const a = ["???", "???", "???", "???", "???"];
  a.forEach((v, i) => console.log(`Q${i + 1}: ${v}`));
}
// Uncomment to test:
// exercise7();

// ─── Exercise 8: Implement ──────────────────────────────────────────────────
// Topic: classList simulation
//
// Implement ClassList wrapping a SimpleNode:
//   add(...cls), remove(...cls), toggle(cls, force?), contains(cls),
//   replace(old, new): boolean, length getter, toString()

class ClassList {
  #node: SimpleNode;
  constructor(node: SimpleNode) { this.#node = node; }

  add(..._cls: string[]): void { /* YOUR CODE */ }
  remove(..._cls: string[]): void { /* YOUR CODE */ }
  toggle(_cls: string, _force?: boolean): boolean { return false; /* YOUR CODE */ }
  contains(_cls: string): boolean { return false; /* YOUR CODE */ }
  replace(_old: string, _new: string): boolean { return false; /* YOUR CODE */ }
  get length(): number { return 0; /* YOUR CODE */ }
  toString(): string { return ""; /* YOUR CODE */ }
}

// Uncomment to test:
// const el8 = new SimpleNode({ tag: "div", classes: ["alert"] });
// const cl = new ClassList(el8);
// cl.add("warning", "bold");
// console.log(cl.toString());       // "alert warning bold"
// cl.remove("alert");
// console.log(cl.toggle("bold"));   // false (removed)
// console.log(cl.toggle("active")); // true (added)
// console.log(cl.replace("warning", "notice")); // true
// console.log(cl.toString());       // "notice active"
// console.log(cl.length);           // 2

// ─── Exercise 9: Implement ──────────────────────────────────────────────────
// Topic: Attribute getter/setter with property sync
//
// getAttribute, setAttribute, removeAttribute, hasAttribute.
// Sync: "id" ↔ node.id, "class" ↔ node classes (space-split).

class AttributeMap {
  #node: SimpleNode;
  constructor(node: SimpleNode) { this.#node = node; }

  getAttribute(_name: string): string | null { return null; /* YOUR CODE */ }
  setAttribute(_name: string, _value: string): void { /* YOUR CODE */ }
  removeAttribute(_name: string): void { /* YOUR CODE */ }
  hasAttribute(_name: string): boolean { return false; /* YOUR CODE */ }
}

// Uncomment to test:
// const el9 = new SimpleNode({ tag: "div" });
// const attrs = new AttributeMap(el9);
// attrs.setAttribute("id", "main");
// console.log(el9.id);                          // "main"
// attrs.setAttribute("class", "foo bar");
// console.log(el9.getClasses());                // ["foo", "bar"]
// attrs.setAttribute("data-role", "admin");
// console.log(attrs.getAttribute("data-role")); // "admin"
// attrs.removeAttribute("id");
// console.log(el9.id);                          // ""

// ─── Exercise 10: Implement ─────────────────────────────────────────────────
// Topic: insertAdjacentElement simulation
//
// insertAdjacent(position, newNode, target): void
// Positions: "beforebegin", "afterbegin", "beforeend", "afterend"
// Throw if beforebegin/afterend and target has no parent.

type Position = "beforebegin" | "afterbegin" | "beforeend" | "afterend";

function insertAdjacent(_pos: Position, _node: SimpleNode, _target: SimpleNode): void {
  // YOUR CODE HERE
}

// Uncomment to test:
// const p10 = new SimpleNode({ tag: "div", id: "parent" });
// const c1 = new SimpleNode({ tag: "p", id: "first" });
// const c2 = new SimpleNode({ tag: "p", id: "second" });
// p10.appendChild(c1); p10.appendChild(c2);
// insertAdjacent("beforebegin", new SimpleNode({ tag: "span", id: "bf" }), c1);
// console.log(p10.children.map(c => c.id)); // ["bf", "first", "second"]
// insertAdjacent("afterbegin", new SimpleNode({ tag: "span", id: "ab" }), p10);
// console.log(p10.children.map(c => c.id)); // ["ab", "bf", "first", "second"]

// ─── Exercise 11: Fix the Bug ───────────────────────────────────────────────
// Topic: removeChild bug — skipping elements when iterating forward
//
// This removes children with a given class but skips some. Fix it.

function exercise11() {
  function removeAllWithClass(parent: SimpleNode, cls: string): void {
    const children = parent.children;
    // BUG: iterating forward while removing shifts indices
    for (let i = 0; i < children.length; i++) {
      if (children[i].hasClass(cls)) {
        parent.removeChild(children[i]);
      }
    }
  }
  void removeAllWithClass;
}
// Uncomment to test:
// exercise11();

// ─── Exercise 12: Fix the Bug ───────────────────────────────────────────────
// Topic: querySelector matching self instead of descendants only
//
// Fix buggyQuerySelector so it only searches descendants, not self.

function exercise12() {
  function buggyQuerySelector(node: SimpleNode, sel: string): SimpleNode | null {
    // BUG: checks self first — should only check descendants
    if (matchesSel(node, sel)) return node;
    for (const child of node.getChildrenRef()) {
      const found = buggyQuerySelector(child, sel);
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
  void buggyQuerySelector;
}
// Uncomment to test:
// exercise12();

// ─── Exercise 13: Fix the Bug ───────────────────────────────────────────────
// Topic: textContent setter doesn't clear existing children
//
// Fix BuggyNode's textContent setter.

function exercise13() {
  class BuggyNode {
    #children: SimpleNode[] = [];
    nodeType: NodeType = "element";
    tagName: string;
    constructor(tag: string) { this.tagName = tag.toUpperCase(); }
    appendChild(child: SimpleNode): void { this.#children.push(child); }
    get children(): SimpleNode[] { return [...this.#children]; }
    get textContent(): string {
      return this.#children.filter(c => c.nodeType === "text").map(c => c.getRawText()).join("");
    }
    // BUG: doesn't clear children before adding text node
    set textContent(value: string) {
      const t = new SimpleNode({ type: "text", text: value });
      this.appendChild(t);
    }
  }
  void BuggyNode;
}
// Uncomment to test:
// exercise13();

// ─── Exercise 14: Implement ─────────────────────────────────────────────────
// Topic: cloneNode simulation
//
// Shallow (deep=false): clone node, no children. Deep: clone all descendants.
// Clone parent is null. Clones are independent of originals.

function cloneNode(_node: SimpleNode, _deep: boolean = false): SimpleNode {
  // YOUR CODE HERE
  return new SimpleNode();
}

// Uncomment to test:
// const orig = new SimpleNode({ tag: "div", id: "orig", classes: ["a", "b"] });
// orig.appendChild(new SimpleNode({ tag: "p", id: "child" }));
// const shallow = cloneNode(orig, false);
// console.log(shallow.children.length);  // 0
// const deep = cloneNode(orig, true);
// console.log(deep.children.length);     // 1
// console.log(deep.children[0].id);      // "child"

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
// Topic: Template renderer → SimpleNode tree
//
// { tag, id?, classes?, attributes?, children?: (Template | string)[] }
// Strings become text nodes. Objects become elements (recursive).

interface Template {
  tag: string;
  id?: string;
  classes?: string[];
  attributes?: Record<string, string>;
  children?: (Template | string)[];
}

function renderTemplate(_tpl: Template): SimpleNode {
  // YOUR CODE HERE
  return new SimpleNode();
}

// Uncomment to test:
// const tpl: Template = {
//   tag: "div", id: "app", classes: ["container"],
//   children: [
//     { tag: "h1", children: ["Welcome"] },
//     { tag: "ul", children: [
//       { tag: "li", classes: ["item"], children: ["Item 1"] },
//       { tag: "li", classes: ["item"], children: ["Item 2"] },
//     ]},
//   ]
// };
// const r = renderTemplate(tpl);
// console.log(r.querySelector("h1")?.textContent);    // "Welcome"
// console.log(r.querySelectorAll("li").length);        // 2
// console.log(r.textContent);                          // "WelcomeItem 1Item 2"

// ─── Exercise 16: Implement ─────────────────────────────────────────────────
// Topic: Sibling navigation functions
//
// previousSibling, nextSibling, nextElementSibling (skips non-element nodes)

function previousSibling(_node: SimpleNode): SimpleNode | null { return null; /* YOUR CODE */ }
function nextSibling(_node: SimpleNode): SimpleNode | null { return null; /* YOUR CODE */ }
function nextElementSibling(_node: SimpleNode): SimpleNode | null { return null; /* YOUR CODE */ }

// Uncomment to test:
// const p16 = new SimpleNode({ tag: "div" });
// const a = new SimpleNode({ tag: "span", id: "a" });
// const t = new SimpleNode({ type: "text", text: " " });
// const b = new SimpleNode({ tag: "span", id: "b" });
// p16.appendChild(a); p16.appendChild(t); p16.appendChild(b);
// console.log(nextSibling(a)?.nodeType);     // "text"
// console.log(nextElementSibling(a)?.id);    // "b" (skips text)
// console.log(previousSibling(a));            // null

// ─── Exercise 17: Implement ─────────────────────────────────────────────────
// Topic: Dataset proxy — camelCase ↔ data-kebab-case conversion
//
// get(prop), set(prop, value), delete(prop): boolean
// "userId" ↔ "data-user-id"

class DatasetProxy {
  #node: SimpleNode;
  constructor(node: SimpleNode) { this.#node = node; }

  get(_prop: string): string | undefined { return undefined; /* YOUR CODE */ }
  set(_prop: string, _value: string): void { /* YOUR CODE */ }
  delete(_prop: string): boolean { return false; /* YOUR CODE */ }
}

// Uncomment to test:
// const el17 = new SimpleNode({ tag: "div", attributes: { "data-user-id": "42", "data-role": "admin" } });
// const ds = new DatasetProxy(el17);
// console.log(ds.get("userId"));  // "42"
// ds.set("active", "true");
// console.log(el17.getRawAttributes()["data-active"]); // "true"
// ds.delete("role");
// console.log(ds.get("role"));    // undefined

// ─── Exercise 18: Implement ─────────────────────────────────────────────────
// Topic: DOM tree diff — compare two SimpleNode trees by position
//
// Returns: { type: "added"|"removed"|"changed", path: string, details: string }[]
// Compare element nodes by tagName, id, classes. Recurse children by index.

interface DiffResult {
  type: "added" | "removed" | "changed";
  path: string;
  details: string;
}

function diffTrees(
  _oldTree: SimpleNode | null,
  _newTree: SimpleNode | null,
  _path?: string
): DiffResult[] {
  // YOUR CODE HERE
  return [];
}

// Uncomment to test:
// const old18 = new SimpleNode({ tag: "div", id: "root" });
// old18.appendChild(new SimpleNode({ tag: "p", id: "a" }));
// old18.appendChild(new SimpleNode({ tag: "span", id: "b" }));
// const new18 = new SimpleNode({ tag: "div", id: "root" });
// new18.appendChild(new SimpleNode({ tag: "p", id: "a" }));
// new18.appendChild(new SimpleNode({ tag: "div", id: "b" }));   // span→div
// new18.appendChild(new SimpleNode({ tag: "p", id: "c" }));     // added
// diffTrees(old18, new18).forEach(d => console.log(`${d.type} at ${d.path}: ${d.details}`));
// Expected: changed at root > 1: tagName: SPAN → DIV
//           added at root > 2: P#c
