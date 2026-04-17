// ============================================================================
// Template Method Pattern — Exercises
// Config: ES2022, strict, ESNext modules. Run: npx tsx exercises.ts
// ============================================================================

// ============================================================================
// EXERCISE 1 — PREDICT: Basic template method execution order
// What does this print?
// ============================================================================

abstract class Beverage {
  prepare(): string[] {
    const log: string[] = [];
    log.push(this.boilWater());
    log.push(this.brew());
    log.push(this.pourInCup());
    log.push(this.addCondiments());
    return log;
  }

  private boilWater(): string {
    return "Boiling water";
  }

  protected abstract brew(): string;

  private pourInCup(): string {
    return "Pouring into cup";
  }

  protected abstract addCondiments(): string;
}

class Tea extends Beverage {
  protected brew(): string {
    return "Steeping tea";
  }
  protected addCondiments(): string {
    return "Adding lemon";
  }
}

// const tea = new Tea();
// console.log(tea.prepare());

// YOUR PREDICTION:
// ____________________________________________


// ============================================================================
// EXERCISE 2 — PREDICT: Hook method behavior
// What does this print?
// ============================================================================

abstract class Report {
  generate(): string[] {
    const parts: string[] = [];
    parts.push(this.header());
    if (this.shouldIncludeBody()) {
      parts.push(this.body());
    }
    parts.push(this.footer());
    return parts;
  }

  protected abstract header(): string;
  protected abstract body(): string;
  protected abstract footer(): string;

  // Hook
  protected shouldIncludeBody(): boolean {
    return true;
  }
}

class SummaryReport extends Report {
  protected header(): string { return "=== Summary ==="; }
  protected body(): string { return "Detailed content here"; }
  protected footer(): string { return "=== End ==="; }
  protected shouldIncludeBody(): boolean { return false; }
}

class FullReport extends Report {
  protected header(): string { return "=== Full Report ==="; }
  protected body(): string { return "All the details"; }
  protected footer(): string { return "=== End ==="; }
}

// const summary = new SummaryReport();
// const full = new FullReport();
// console.log("Summary:", summary.generate());
// console.log("Full:", full.generate());

// YOUR PREDICTION:
// ____________________________________________


// ============================================================================
// EXERCISE 3 — PREDICT: Default implementation override
// What does this print?
// ============================================================================

abstract class FileProcessor {
  process(filename: string): string[] {
    const log: string[] = [];
    log.push(this.open(filename));
    log.push(this.read());
    log.push(this.transform());
    log.push(this.close());
    return log;
  }

  protected open(filename: string): string {
    return `Opening ${filename}`;
  }

  protected abstract read(): string;

  // Default implementation
  protected transform(): string {
    return "No transformation";
  }

  protected close(): string {
    return "File closed";
  }
}

class JsonProcessor extends FileProcessor {
  protected read(): string {
    return "Reading JSON";
  }
  protected transform(): string {
    return "Parsing JSON to object";
  }
}

class TextProcessor extends FileProcessor {
  protected read(): string {
    return "Reading plain text";
  }
  // Uses default transform
}

// const json = new JsonProcessor();
// const text = new TextProcessor();
// console.log("JSON:", json.process("data.json"));
// console.log("Text:", text.process("readme.txt"));

// YOUR PREDICTION:
// ____________________________________________


// ============================================================================
// EXERCISE 4 — PREDICT: Multiple hooks and step ordering
// What does this print?
// ============================================================================

abstract class Deployment {
  deploy(): string[] {
    const steps: string[] = [];
    steps.push("Start deployment");
    this.beforeBuild(steps);
    steps.push(this.build());
    this.afterBuild(steps);
    steps.push(this.test());
    if (this.shouldDeploy()) {
      steps.push(this.release());
    }
    steps.push("Deployment complete");
    return steps;
  }

  protected abstract build(): string;
  protected abstract test(): string;
  protected abstract release(): string;

  // Hooks
  protected beforeBuild(steps: string[]): void { /* empty */ }
  protected afterBuild(steps: string[]): void { /* empty */ }
  protected shouldDeploy(): boolean { return true; }
}

class StagingDeploy extends Deployment {
  protected build(): string { return "Build for staging"; }
  protected test(): string { return "Run staging tests"; }
  protected release(): string { return "Deploy to staging"; }
  protected beforeBuild(steps: string[]): void {
    steps.push("Cleaning staging cache");
  }
  protected shouldDeploy(): boolean { return false; }
}

// const staging = new StagingDeploy();
// console.log(staging.deploy());

// YOUR PREDICTION:
// ____________________________________________


// ============================================================================
// EXERCISE 5 — FIX: Template method is being overridden by subclass
// The subclass incorrectly overrides the template method itself.
// Fix so the algorithm skeleton is preserved.
// ============================================================================

abstract class OrderPipeline {
  processOrder(): string[] {
    const log: string[] = [];
    log.push(this.validate());
    log.push(this.calculateTotal());
    log.push(this.applyDiscount());
    log.push(this.charge());
    return log;
  }

  protected abstract validate(): string;
  protected abstract calculateTotal(): string;
  protected abstract charge(): string;

  protected applyDiscount(): string {
    return "No discount";
  }
}

class PremiumOrder extends OrderPipeline {
  protected validate(): string { return "Premium validation"; }
  protected calculateTotal(): string { return "Calculated: $100"; }
  protected charge(): string { return "Charged premium account"; }

  // BUG: This overrides the template method, breaking the pipeline
  processOrder(): string[] {
    return [this.charge(), this.validate()]; // Wrong order, missing steps
  }
}

// FIX: Make the subclass NOT override processOrder.
// Instead, override only applyDiscount to return "20% premium discount".

// TEST:
// const order = new PremiumOrder();
// const result = order.processOrder();
// console.assert(result.length === 4, "Should have 4 steps");
// console.assert(result[2] === "20% premium discount", "Should apply premium discount");
// console.log("Exercise 5 passed");


// ============================================================================
// EXERCISE 6 — FIX: Abstract method not implemented & hook logic inverted
// Fix compilation errors and incorrect hook behavior.
// ============================================================================

abstract class Notification {
  send(recipient: string): string[] {
    const log: string[] = [];
    log.push(this.formatMessage());
    if (this.shouldLog()) {
      log.push(`Logged notification to ${recipient}`);
    }
    log.push(this.deliver(recipient));
    return log;
  }

  protected abstract formatMessage(): string;
  protected abstract deliver(recipient: string): string;

  // Hook: should default to true
  protected shouldLog(): boolean {
    return false; // BUG: default should be true
  }
}

class EmailNotification extends Notification {
  protected formatMessage(): string {
    return "HTML email formatted";
  }
  // BUG: deliver is not implemented — will cause compile error
  // Also: shouldLog should remain default (true) for email
}

class SmsNotification extends Notification {
  protected formatMessage(): string {
    return "SMS text formatted";
  }
  protected deliver(recipient: string): string {
    return `SMS sent to ${recipient}`;
  }
  // SMS should NOT log
  protected shouldLog(): boolean {
    return false;
  }
}

// FIX the bugs above so these tests pass:

// TEST:
// const email = new EmailNotification();
// const emailResult = email.send("alice@example.com");
// console.assert(emailResult.length === 3, "Email should have 3 entries (with log)");
// console.assert(emailResult[1] === "Logged notification to alice@example.com");
//
// const sms = new SmsNotification();
// const smsResult = sms.send("+1234567890");
// console.assert(smsResult.length === 2, "SMS should have 2 entries (no log)");
// console.log("Exercise 6 passed");


// ============================================================================
// EXERCISE 7 — IMPLEMENT: Sorting algorithm template
// Implement a template method for sorting that allows subclasses to define
// the comparison logic.
// ============================================================================

// Requirements:
// - Abstract class `Sorter<T>` with template method `sort(items: T[]): T[]`
// - Algorithm: copy array → compare pairs → swap if needed (bubble sort is fine)
// - Abstract method: `compare(a: T, b: T): number`
// - Hook: `onSwap(a: T, b: T): void` — called each time a swap occurs
// - Create `NumberAscSorter` (ascending numbers)
// - Create `StringLengthSorter` (sort strings by length, shortest first)

// YOUR IMPLEMENTATION HERE:


// TEST:
// const numSorter = new NumberAscSorter();
// console.assert(JSON.stringify(numSorter.sort([3, 1, 4, 1, 5])) === JSON.stringify([1, 1, 3, 4, 5]));
//
// const strSorter = new StringLengthSorter();
// console.assert(
//   JSON.stringify(strSorter.sort(["hello", "hi", "hey"])) === JSON.stringify(["hi", "hey", "hello"])
// );
// console.log("Exercise 7 passed");


// ============================================================================
// EXERCISE 8 — IMPLEMENT: Build pipeline template
// Implement a CI/CD build pipeline using template method.
// ============================================================================

// Requirements:
// - Abstract class `BuildPipeline` with template method `run(): string[]`
// - Steps: `checkout()` → `install()` → `lint()` → `test()` → `build()` → `deploy()`
// - `checkout()` and `install()` have default implementations returning
//   "Checked out code" and "Installed dependencies"
// - `lint()`, `test()`, `build()` are abstract
// - `deploy()` is abstract
// - Hook: `shouldDeploy(): boolean` — if false, skip deploy step
// - Create `NodePipeline`: lint="ESLint passed", test="Jest passed",
//   build="Webpack bundled", deploy="Deployed to Vercel"
// - Create `RustPipeline`: lint="Clippy passed", test="Cargo test passed",
//   build="Cargo build done", deploy="Deployed to AWS", shouldDeploy=false

// YOUR IMPLEMENTATION HERE:


// TEST:
// const node = new NodePipeline();
// const nodeResult = node.run();
// console.assert(nodeResult.length === 6, "Node should have 6 steps");
// console.assert(nodeResult[5] === "Deployed to Vercel");
//
// const rust = new RustPipeline();
// const rustResult = rust.run();
// console.assert(rustResult.length === 5, "Rust should have 5 steps (no deploy)");
// console.log("Exercise 8 passed");


// ============================================================================
// EXERCISE 9 — IMPLEMENT: Game character turn template
// ============================================================================

// Requirements:
// - Abstract class `GameCharacter` with template method `takeTurn(): string[]`
// - Steps: `startTurn()` → `chooseAction()` → `performAction()` → `endTurn()`
// - `startTurn()` default: "Turn started"
// - `endTurn()` default: "Turn ended"
// - `chooseAction()` and `performAction()` are abstract
// - Hook: `beforeAction(): string | null` — if returns string, insert it before performAction
// - Create `Warrior`: chooseAction="Selects melee attack", performAction="Swings sword"
// - Create `Mage`: chooseAction="Selects spell", performAction="Casts fireball",
//   beforeAction="Channels mana"

// YOUR IMPLEMENTATION HERE:


// TEST:
// const warrior = new Warrior();
// const wResult = warrior.takeTurn();
// console.assert(wResult.length === 4, `Warrior should have 4 steps, got ${wResult.length}`);
//
// const mage = new Mage();
// const mResult = mage.takeTurn();
// console.assert(mResult.length === 5, `Mage should have 5 steps, got ${mResult.length}`);
// console.assert(mResult[2] === "Channels mana");
// console.log("Exercise 9 passed");


// ============================================================================
// EXERCISE 10 — IMPLEMENT: Authentication flow template
// ============================================================================

// Requirements:
// - Abstract class `AuthFlow` with template method `authenticate(credentials: {username: string; password: string}): {success: boolean; steps: string[]}`
// - Steps: `validateInput(credentials)` → `findUser(username)` → `verifyPassword(password)` → `onSuccess(username)` / `onFailure(username)`
// - `validateInput` default: returns true if both fields non-empty, pushes "Input validated" or "Input invalid"
// - `findUser` abstract: returns boolean, pushes step description
// - `verifyPassword` abstract: returns boolean, pushes step description
// - `onSuccess` hook: pushes "Login successful for {username}" by default
// - `onFailure` hook: pushes "Login failed for {username}" by default
// - Short-circuit: if any step fails, skip remaining steps and call onFailure
// - Create `DatabaseAuth`: findUser always returns true "User found in DB", verifyPassword checks password !== "" "Password verified against DB"
// - Create `LdapAuth`: findUser always returns true "User found in LDAP", verifyPassword always returns true "LDAP bind successful", onSuccess pushes "Session token generated for {username}"

// YOUR IMPLEMENTATION HERE:


// TEST:
// const dbAuth = new DatabaseAuth();
// const dbResult = dbAuth.authenticate({ username: "alice", password: "secret" });
// console.assert(dbResult.success === true);
// console.assert(dbResult.steps.length === 4);
//
// const dbFail = dbAuth.authenticate({ username: "alice", password: "" });
// console.assert(dbFail.success === false);
//
// const ldap = new LdapAuth();
// const ldapResult = ldap.authenticate({ username: "bob", password: "pass" });
// console.assert(ldapResult.steps[3] === "Session token generated for bob");
// console.log("Exercise 10 passed");


// ============================================================================
// EXERCISE 11 — IMPLEMENT: Document export template with multiple hooks
// ============================================================================

// Requirements:
// - Abstract class `DocumentExporter` with template method
//   `export(title: string, sections: string[]): string`
// - Steps: `formatTitle(title)` → `formatSections(sections)` → `addHeader()` → `addFooter()`
//   → combine: header + title + sections.join + footer
// - `formatTitle` and `formatSections` are abstract (return string / string[])
// - `addHeader()` default: "" (empty)
// - `addFooter()` default: "" (empty)
// - Create `HtmlExporter`:
//   - formatTitle: wraps in <h1> tags
//   - formatSections: wraps each in <p> tags
//   - addHeader: returns "<!DOCTYPE html>"
//   - addFooter: returns "</html>"
// - Create `MarkdownExporter`:
//   - formatTitle: prepends "# "
//   - formatSections: prepends "- " to each
//   - no header/footer overrides

// YOUR IMPLEMENTATION HERE:


// TEST:
// const html = new HtmlExporter();
// const htmlOut = html.export("Test", ["A", "B"]);
// console.assert(htmlOut.includes("<h1>Test</h1>"));
// console.assert(htmlOut.includes("<!DOCTYPE html>"));
// console.assert(htmlOut.includes("</html>"));
//
// const md = new MarkdownExporter();
// const mdOut = md.export("Test", ["A", "B"]);
// console.assert(mdOut.includes("# Test"));
// console.assert(mdOut.includes("- A"));
// console.assert(!mdOut.includes("<!DOCTYPE"));
// console.log("Exercise 11 passed");


// ============================================================================
// EXERCISE 12 — IMPLEMENT: Data validation pipeline template
// ============================================================================

// Requirements:
// - Abstract class `ValidationPipeline<T>` with template method
//   `validate(data: T): { valid: boolean; errors: string[] }`
// - Steps: `sanitize(data)` → `checkRequired(data)` → `checkFormat(data)` → `checkBusiness(data)`
// - Each check method returns `string | null` (null = passed, string = error message)
// - `sanitize` has a default (returns data unchanged), subclass can override
// - `checkRequired`, `checkFormat` are abstract
// - `checkBusiness` hook: returns null by default
// - Template method collects all non-null errors, valid = (errors.length === 0)
//
// - Create `EmailValidator` (T = string):
//   - sanitize: trim and lowercase
//   - checkRequired: error if empty
//   - checkFormat: error if no "@" or no "." after "@"
//   - checkBusiness: error if domain is "tempmail.com"
//
// - Create `AgeValidator` (T = number):
//   - checkRequired: error if NaN
//   - checkFormat: error if not integer
//   - checkBusiness: error if < 0 or > 150

// YOUR IMPLEMENTATION HERE:


// TEST:
// const emailVal = new EmailValidator();
// console.assert(emailVal.validate("  Alice@Gmail.Com  ").valid === true);
// console.assert(emailVal.validate("").valid === false);
// console.assert(emailVal.validate("noatsign").valid === false);
// console.assert(emailVal.validate("user@tempmail.com").valid === false);
//
// const ageVal = new AgeValidator();
// console.assert(ageVal.validate(25).valid === true);
// console.assert(ageVal.validate(NaN).valid === false);
// console.assert(ageVal.validate(3.5).valid === false);
// console.assert(ageVal.validate(-1).valid === false);
// console.log("Exercise 12 passed");
