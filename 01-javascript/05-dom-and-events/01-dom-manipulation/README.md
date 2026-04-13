# DOM Manipulation

The Document Object Model (DOM) is a programming interface that represents an HTML document as a tree of objects. Every element, text, and comment becomes a node in this tree. JavaScript uses the DOM API to read, modify, and respond to page structure and content.

---

## 1. The DOM Tree

When a browser loads HTML, it parses the markup and builds a tree called the DOM tree:

```js
// <html>
//   <head><title>Page</title></head>
//   <body>
//     <h1>Hello</h1>
//     <!-- a comment -->
//     <p>World</p>
//   </body>
// </html>
//
// DOM tree:
// document
// └── html (Element)
//     ├── head → title → "Page" (Text)
//     └── body
//         ├── "\n    " (Text — whitespace)
//         ├── h1 → "Hello" (Text)
//         ├── <!-- a comment --> (Comment)
//         └── p → "World" (Text)
```

- **Everything** in HTML becomes a DOM node — elements, text (including whitespace), and comments.
- `document` is the entry point; `document.documentElement` = `<html>`, `document.body` = `<body>`.

---

## 2. Node Types

| Node kind | `nodeType` | `nodeName` | `nodeValue` |
|-----------|-----------|------------|-------------|
| Element | `1` | Tag name uppercase: `"DIV"` | `null` |
| Text | `3` | `"#text"` | The text content |
| Comment | `8` | `"#comment"` | The comment content |
| Document | `9` | `"#document"` | `null` |
| DocumentFragment | `11` | `"#document-fragment"` | `null` |

```js
const div = document.createElement("div");
div.nodeType;  // 1
div.nodeName;  // "DIV"

const text = document.createTextNode("hello");
text.nodeType;  // 3
text.nodeValue; // "hello"
```

---

## 3. Walking the DOM — All Nodes

Properties that navigate **all** node types (elements, text, comments):

```
                parentNode
                    │
  previousSibling ← node → nextSibling
                    │
    ┌───────────────┼───────────────┐
firstChild     childNodes[i]     lastChild
```

```js
document.body.childNodes;    // NodeList [text, p, text, p, text] — includes whitespace
document.body.firstChild;   // #text (whitespace before first element)

const firstP = document.body.childNodes[1];
firstP.parentNode;       // <body>
firstP.nextSibling;      // #text (whitespace)
```

**Important:** `childNodes` is a **live** NodeList — it updates automatically when the DOM changes.

---

## 4. Element-Only Navigation

Skip text and comment nodes with element-specific properties:

```
               parentElement
                    │
previousElementSibling ← element → nextElementSibling
                    │
    ┌───────────────┼───────────────┐
firstElementChild children[i]  lastElementChild
```

```js
document.body.children;            // HTMLCollection [p, p] — elements only
document.body.firstElementChild;   // first <p>
document.body.childElementCount;   // 2

firstP.nextElementSibling;         // second <p> — skips text/comment nodes
```

> **Rule of thumb:** Use element-only navigation unless you specifically need text/comment nodes.

---

## 5. Searching — getElementById, getElementsBy*

```js
document.getElementById("main");           // single element or null (by ID)
document.getElementsByClassName("note");   // live HTMLCollection
document.getElementsByTagName("div");      // live HTMLCollection
document.getElementsByTagName("*");        // all elements
```

`getElementsBy*` methods return **live** HTMLCollections that reflect the current DOM state.

---

## 6. querySelector, querySelectorAll

```js
document.querySelector(".note");           // first match or null
document.querySelectorAll("ul > li.active"); // static NodeList of all matches

// Scoped search:
const nav = document.querySelector("nav");
nav.querySelectorAll("a.link"); // only within <nav>
```

---

## 7. Live vs Static Collections

| Method | Returns | Live? |
|--------|---------|-------|
| `getElementById` | Element / `null` | N/A |
| `getElementsByClassName` | HTMLCollection | **Yes** |
| `getElementsByTagName` | HTMLCollection | **Yes** |
| `querySelector` | Element / `null` | N/A |
| `querySelectorAll` | NodeList | **No (static)** |

```js
const live = document.getElementsByTagName("div"); // live
const snap = document.querySelectorAll("div");      // static snapshot

document.body.appendChild(document.createElement("div"));
live.length; // increased by 1
snap.length; // unchanged — snapshot at query time
```

> Prefer `querySelector`/`querySelectorAll` for versatility. Use `getElementById` for fast ID lookups.

---

## 8. matches(), closest(), contains()

### matches(selector)

Tests whether an element matches a CSS selector:

```js
// <li class="item active" id="first">
el.matches(".item");          // true
el.matches(".item.active");   // true
el.matches("ul > li");        // true (any valid CSS selector)
el.matches(".error");         // false
```

### closest(selector)

Walks **up** the DOM tree (starting from the element itself) and returns the first ancestor that matches:

```js
// <div class="container"> <ul class="list"> <li class="item">...
const li = document.querySelector(".item");
li.closest(".list");       // <ul class="list"> — parent matches
li.closest(".container");  // <div class="container"> — grandparent
li.closest("li");          // the <li> itself — starts from self
li.closest(".missing");    // null — not found
```

### contains(node)

Checks if a node is a descendant of another (or the same node):

```js
container.contains(child);      // true — child is a descendant
child.contains(container);      // false — container is an ancestor
container.contains(container);  // true — same node
```

---

## 9. innerHTML, outerHTML, textContent, innerText

```js
// <div id="box"><p>Hello <b>World</b></p></div>

box.innerHTML;    // "<p>Hello <b>World</b></p>" — HTML markup inside
box.textContent;  // "Hello World" — all text, tags stripped

// Setting textContent is XSS-safe (no HTML parsing):
box.textContent = "<b>Not bold</b>";
box.innerHTML;    // "&lt;b&gt;Not bold&lt;/b&gt;" — escaped

box.outerHTML;    // includes the element itself in the markup
```

### innerText vs textContent

| | `textContent` | `innerText` |
|---|---|---|
| Includes hidden text (`display:none`) | Yes | No |
| Includes `<script>`/`<style>` content | Yes | No |
| Triggers reflow | No | Yes |
| Returns whitespace as-is | Yes | Normalized |

```js
// <div><span>Visible</span><span style="display:none">Hidden</span></div>
div.textContent; // "VisibleHidden"
div.innerText;   // "Visible"
```

> **Prefer `textContent`** — it's faster (no layout computation), includes all text, and is safe for setting user-provided strings.

---

## 10. Creating Elements

```js
const div = document.createElement("div");
div.className = "alert";
div.innerHTML = "<strong>Warning!</strong>";
// Exists in memory but NOT in the document yet

const text = document.createTextNode("Hello!");

// DocumentFragment — lightweight container, inserts only its children:
const fragment = document.createDocumentFragment();
for (let i = 0; i < 100; i++) {
  const li = document.createElement("li");
  li.textContent = `Item ${i}`;
  fragment.appendChild(li);
}
document.querySelector("ul").appendChild(fragment); // single DOM insertion
```

---

## 11. Inserting Elements

```js
// Classic (Node interface):
parent.appendChild(child);                  // add as last child
parent.insertBefore(newChild, refChild);    // insert before reference

// Modern (Element interface) — accept nodes AND strings:
parent.append(node1, "text", node2);        // add to end
parent.prepend(node1, "text");              // add to beginning
element.before(newNode);                    // insert before element
element.after(newNode);                     // insert after element
element.replaceWith(newNode);               // replace element
```

If a node already exists in the DOM, these methods **move** it (not clone).

```js
// Example:
// <ul id="list"><li>First</li></ul>
const list = document.getElementById("list");
const li = document.createElement("li");
li.textContent = "Second";
list.append(li);     // <ul><li>First</li><li>Second</li></ul>

const li0 = document.createElement("li");
li0.textContent = "Zero";
list.prepend(li0);   // <ul><li>Zero</li><li>First</li><li>Second</li></ul>
```

---

## 12. insertAdjacentHTML / Text / Element

Four positions relative to an element:

```
<!-- beforebegin -->
<div id="target">
  <!-- afterbegin -->
  content
  <!-- beforeend -->
</div>
<!-- afterend -->
```

```js
el.insertAdjacentHTML("beforeend", "<p>New</p>"); // parses HTML, inserts nodes
el.insertAdjacentText("afterbegin", "Safe text"); // inserts text node (no parsing)
el.insertAdjacentElement("beforebegin", span);    // inserts existing element
```

> Unlike `innerHTML +=`, `insertAdjacentHTML` does **not** re-parse existing content.

---

## 13. Removing Elements

```js
el.remove();                          // remove from DOM
parent.removeChild(child);            // older approach — returns removed node
parent.innerHTML = "";                // remove all children
parent.replaceChildren();             // modern — remove all children
```

---

## 14. Cloning — cloneNode

```js
const shallow = original.cloneNode(false); // element only, no children
const deep = original.cloneNode(true);     // element + all descendants
// addEventListener handlers are NOT cloned; inline handlers (attributes) ARE
```

---

## 15. Attributes vs Properties

```js
input.getAttribute("value");  // HTML attribute — reflects original markup
input.value;                   // DOM property — reflects current state

input.setAttribute("data-role", "admin");
input.hasAttribute("type");   // true
input.removeAttribute("id");
```

**Sync rules:** Some attributes and properties stay in sync, others don't:

| Attribute | Property | Sync behavior |
|-----------|----------|---------------|
| `id` | `el.id` | Both ways |
| `class` | `el.className` | Both ways |
| `href` | `el.href` | Attribute = relative, Property = absolute URL |
| `value` (input) | `el.value` | Attribute → property (initial only). Typing updates property, NOT attribute |
| `checked` | `el.checked` | Attribute → property (initial only) |
| `style` | `el.style` | Attribute = string, Property = CSSStyleDeclaration object |

```js
// After user types "Bob" into an input with value="Alice":
input.value;                   // "Bob" — current state (property)
input.getAttribute("value");   // "Alice" — original HTML (attribute)
```

### dataset — Custom data attributes

```js
// <div data-user-id="42" data-role="admin">
div.dataset.userId;          // "42" — camelCase conversion
div.dataset.active = "true"; // sets data-active="true"
delete div.dataset.role;     // removes data-role
```

---

## 16. Classes — className, classList

```js
el.className = "notice";  // replaces ALL classes (string)

// classList — fine-grained manipulation:
el.classList.add("active", "bold");
el.classList.remove("hidden");
el.classList.toggle("active");           // add/remove
el.classList.toggle("dark", isDark);     // force add/remove
el.classList.contains("active");         // boolean
el.classList.replace("old", "new");
```

> **Always prefer `classList`** over `className` for individual class changes.

---

## 17. Styles — element.style, getComputedStyle

```js
// element.style — reads/writes INLINE styles only:
el.style.backgroundColor = "red";
el.style.cssText = "color: blue; font-size: 20px;"; // set multiple
el.style.removeProperty("background-color");

// getComputedStyle — final computed value (read-only):
const computed = getComputedStyle(el);
computed.fontSize;       // "16px" — resolved from all CSS sources
computed.backgroundColor; // "rgb(255, 0, 0)"

// CSS custom properties:
el.style.setProperty("--main-color", "blue");
getComputedStyle(el).getPropertyValue("--main-color");
```

`element.style` returns `""` for properties not set inline. `getComputedStyle` returns the actual rendered value.

---

## 18. Element Size and Position

```
┌──────────────────────────────────┐
│           border                 │
│  ┌──────────────────────────┐   │ ← offsetWidth/offsetHeight
│  │        padding            │   │   (border + padding + content)
│  │  ┌──────────────────┐   │   │
│  │  │    content        │   │   │ ← clientWidth/clientHeight
│  │  └──────────────────┘   │   │   (padding + content, NO border/scrollbar)
│  └──────────────────────────┘   │
└──────────────────────────────────┘
```

```js
el.offsetWidth; el.offsetHeight;  // includes border + padding + content
el.clientWidth; el.clientHeight;  // padding + content (no border/scrollbar)
el.scrollWidth; el.scrollHeight;  // full content including overflow
el.scrollTop;                      // how far scrolled

const rect = el.getBoundingClientRect();
rect.top; rect.left; rect.width; rect.height; // relative to viewport
// Page coordinates: rect.left + window.scrollX, rect.top + window.scrollY
```

---

## 19. Performance Tips

- **Cache DOM reads:** `const len = el.children.length` before loops.
- **Batch writes:** Use `DocumentFragment` or `insertAdjacentHTML` instead of many `appendChild` calls.
- **Avoid layout thrashing:** Don't alternate reads (`offsetWidth`) and writes (`style.width`) — batch all reads, then all writes.

---

## References

- [javascript.info — Document](https://javascript.info/document)
- [javascript.info — DOM tree](https://javascript.info/dom-nodes)
- [javascript.info — Walking the DOM](https://javascript.info/dom-navigation)
- [javascript.info — Searching: getElement*, querySelector*](https://javascript.info/searching-elements-dom)
- [javascript.info — Node properties](https://javascript.info/basic-dom-node-properties)
- [javascript.info — Modifying the document](https://javascript.info/modifying-document)
- [javascript.info — Styles and classes](https://javascript.info/styles-and-classes)
- [MDN — Document](https://developer.mozilla.org/en-US/docs/Web/API/Document)
- [MDN — Element](https://developer.mozilla.org/en-US/docs/Web/API/Element)
- [MDN — Node](https://developer.mozilla.org/en-US/docs/Web/API/Node)
- [MDN — querySelector](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector)
- [MDN — classList](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList)
- [MDN — createElement](https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement)
- [MDN — insertAdjacentHTML](https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML)
