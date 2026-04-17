// ============================================================================
// Template Method Pattern — Solutions
// Config: ES2022, strict, ESNext modules. Run: npx tsx solutions.ts
// ============================================================================

// ============================================================================
// SOLUTION 1 — PREDICT
// Output:
// ["Boiling water", "Steeping tea", "Pouring into cup", "Adding lemon"]
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
  private boilWater(): string { return "Boiling water"; }
  protected abstract brew(): string;
  private pourInCup(): string { return "Pouring into cup"; }
  protected abstract addCondiments(): string;
}

class Tea extends Beverage {
  protected brew(): string { return "Steeping tea"; }
  protected addCondiments(): string { return "Adding lemon"; }
}

const tea = new Tea();
console.log("Solution 1:", tea.prepare());


// ============================================================================
// SOLUTION 2 — PREDICT
// Summary: ["=== Summary ===", "=== End ==="]  (body skipped by hook)
// Full: ["=== Full Report ===", "All the details", "=== End ==="]
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
  protected shouldIncludeBody(): boolean { return true; }
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

console.log("Solution 2 Summary:", new SummaryReport().generate());
console.log("Solution 2 Full:", new FullReport().generate());


// ============================================================================
// SOLUTION 3 — PREDICT
// JSON: ["Opening data.json", "Reading JSON", "Parsing JSON to object", "File closed"]
// Text: ["Opening readme.txt", "Reading plain text", "No transformation", "File closed"]
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
  protected open(filename: string): string { return `Opening ${filename}`; }
  protected abstract read(): string;
  protected transform(): string { return "No transformation"; }
  protected close(): string { return "File closed"; }
}

class JsonProcessor extends FileProcessor {
  protected read(): string { return "Reading JSON"; }
  protected transform(): string { return "Parsing JSON to object"; }
}

class TextProcessor extends FileProcessor {
  protected read(): string { return "Reading plain text"; }
}

console.log("Solution 3 JSON:", new JsonProcessor().process("data.json"));
console.log("Solution 3 Text:", new TextProcessor().process("readme.txt"));


// ============================================================================
// SOLUTION 4 — PREDICT
// ["Start deployment", "Cleaning staging cache", "Build for staging",
//  "Run staging tests", "Deployment complete"]
// (afterBuild hook is empty, shouldDeploy=false so release is skipped)
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
  protected beforeBuild(_steps: string[]): void {}
  protected afterBuild(_steps: string[]): void {}
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

console.log("Solution 4:", new StagingDeploy().deploy());


// ============================================================================
// SOLUTION 5 — FIX
// Removed the processOrder override from PremiumOrder.
// Added applyDiscount override instead.
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
  protected applyDiscount(): string { return "No discount"; }
}

class PremiumOrder extends OrderPipeline {
  protected validate(): string { return "Premium validation"; }
  protected calculateTotal(): string { return "Calculated: $100"; }
  protected charge(): string { return "Charged premium account"; }
  protected applyDiscount(): string { return "20% premium discount"; }
}

const order5 = new PremiumOrder();
const result5 = order5.processOrder();
console.assert(result5.length === 4, "Should have 4 steps");
console.assert(result5[2] === "20% premium discount", "Should apply premium discount");
console.log("Solution 5 passed");


// ============================================================================
// SOLUTION 6 — FIX
// Fixed: shouldLog default to true, implemented deliver in EmailNotification
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
  protected shouldLog(): boolean { return true; }
}

class EmailNotification extends Notification {
  protected formatMessage(): string { return "HTML email formatted"; }
  protected deliver(recipient: string): string {
    return `Email sent to ${recipient}`;
  }
}

class SmsNotification extends Notification {
  protected formatMessage(): string { return "SMS text formatted"; }
  protected deliver(recipient: string): string {
    return `SMS sent to ${recipient}`;
  }
  protected shouldLog(): boolean { return false; }
}

const email6 = new EmailNotification();
const emailResult6 = email6.send("alice@example.com");
console.assert(emailResult6.length === 3, "Email should have 3 entries");
console.assert(emailResult6[1] === "Logged notification to alice@example.com");

const sms6 = new SmsNotification();
const smsResult6 = sms6.send("+1234567890");
console.assert(smsResult6.length === 2, "SMS should have 2 entries");
console.log("Solution 6 passed");


// ============================================================================
// SOLUTION 7 — IMPLEMENT: Sorting template
// ============================================================================

abstract class Sorter<T> {
  sort(items: T[]): T[] {
    const arr = [...items];
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        if (this.compare(arr[j], arr[j + 1]) > 0) {
          this.onSwap(arr[j], arr[j + 1]);
          const temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
        }
      }
    }
    return arr;
  }

  protected abstract compare(a: T, b: T): number;
  protected onSwap(_a: T, _b: T): void {}
}

class NumberAscSorter extends Sorter<number> {
  protected compare(a: number, b: number): number { return a - b; }
}

class StringLengthSorter extends Sorter<string> {
  protected compare(a: string, b: string): number { return a.length - b.length; }
}

const numSorter = new NumberAscSorter();
console.assert(JSON.stringify(numSorter.sort([3, 1, 4, 1, 5])) === JSON.stringify([1, 1, 3, 4, 5]));

const strSorter = new StringLengthSorter();
console.assert(
  JSON.stringify(strSorter.sort(["hello", "hi", "hey"])) === JSON.stringify(["hi", "hey", "hello"])
);
console.log("Solution 7 passed");


// ============================================================================
// SOLUTION 8 — IMPLEMENT: Build pipeline
// ============================================================================

abstract class BuildPipeline {
  run(): string[] {
    const steps: string[] = [];
    steps.push(this.checkout());
    steps.push(this.install());
    steps.push(this.lint());
    steps.push(this.test());
    steps.push(this.build());
    if (this.shouldDeploy()) {
      steps.push(this.deploy());
    }
    return steps;
  }

  protected checkout(): string { return "Checked out code"; }
  protected install(): string { return "Installed dependencies"; }
  protected abstract lint(): string;
  protected abstract test(): string;
  protected abstract build(): string;
  protected abstract deploy(): string;
  protected shouldDeploy(): boolean { return true; }
}

class NodePipeline extends BuildPipeline {
  protected lint(): string { return "ESLint passed"; }
  protected test(): string { return "Jest passed"; }
  protected build(): string { return "Webpack bundled"; }
  protected deploy(): string { return "Deployed to Vercel"; }
}

class RustPipeline extends BuildPipeline {
  protected lint(): string { return "Clippy passed"; }
  protected test(): string { return "Cargo test passed"; }
  protected build(): string { return "Cargo build done"; }
  protected deploy(): string { return "Deployed to AWS"; }
  protected shouldDeploy(): boolean { return false; }
}

const node8 = new NodePipeline();
const nodeResult8 = node8.run();
console.assert(nodeResult8.length === 6, "Node should have 6 steps");
console.assert(nodeResult8[5] === "Deployed to Vercel");

const rust8 = new RustPipeline();
const rustResult8 = rust8.run();
console.assert(rustResult8.length === 5, "Rust should have 5 steps");
console.log("Solution 8 passed");


// ============================================================================
// SOLUTION 9 — IMPLEMENT: Game character turn
// ============================================================================

abstract class GameCharacter {
  takeTurn(): string[] {
    const log: string[] = [];
    log.push(this.startTurn());
    log.push(this.chooseAction());
    const before = this.beforeAction();
    if (before !== null) {
      log.push(before);
    }
    log.push(this.performAction());
    log.push(this.endTurn());
    return log;
  }

  protected startTurn(): string { return "Turn started"; }
  protected endTurn(): string { return "Turn ended"; }
  protected abstract chooseAction(): string;
  protected abstract performAction(): string;
  protected beforeAction(): string | null { return null; }
}

class Warrior extends GameCharacter {
  protected chooseAction(): string { return "Selects melee attack"; }
  protected performAction(): string { return "Swings sword"; }
}

class Mage extends GameCharacter {
  protected chooseAction(): string { return "Selects spell"; }
  protected performAction(): string { return "Casts fireball"; }
  protected beforeAction(): string | null { return "Channels mana"; }
}

const warrior9 = new Warrior();
const wResult9 = warrior9.takeTurn();
console.assert(wResult9.length === 4, `Warrior should have 4 steps, got ${wResult9.length}`);

const mage9 = new Mage();
const mResult9 = mage9.takeTurn();
console.assert(mResult9.length === 5, `Mage should have 5 steps, got ${mResult9.length}`);
console.assert(mResult9[2] === "Channels mana");
console.log("Solution 9 passed");


// ============================================================================
// SOLUTION 10 — IMPLEMENT: Authentication flow
// ============================================================================

abstract class AuthFlow {
  authenticate(credentials: { username: string; password: string }): { success: boolean; steps: string[] } {
    const steps: string[] = [];

    if (!this.validateInput(credentials, steps)) {
      this.onFailure(credentials.username, steps);
      return { success: false, steps };
    }

    if (!this.findUser(credentials.username, steps)) {
      this.onFailure(credentials.username, steps);
      return { success: false, steps };
    }

    if (!this.verifyPassword(credentials.password, steps)) {
      this.onFailure(credentials.username, steps);
      return { success: false, steps };
    }

    this.onSuccess(credentials.username, steps);
    return { success: true, steps };
  }

  protected validateInput(
    credentials: { username: string; password: string },
    steps: string[]
  ): boolean {
    if (credentials.username && credentials.password) {
      steps.push("Input validated");
      return true;
    }
    steps.push("Input invalid");
    return false;
  }

  protected abstract findUser(username: string, steps: string[]): boolean;
  protected abstract verifyPassword(password: string, steps: string[]): boolean;

  protected onSuccess(username: string, steps: string[]): void {
    steps.push(`Login successful for ${username}`);
  }

  protected onFailure(username: string, steps: string[]): void {
    steps.push(`Login failed for ${username}`);
  }
}

class DatabaseAuth extends AuthFlow {
  protected findUser(username: string, steps: string[]): boolean {
    steps.push("User found in DB");
    return true;
  }
  protected verifyPassword(password: string, steps: string[]): boolean {
    steps.push("Password verified against DB");
    return password !== "";
  }
}

class LdapAuth extends AuthFlow {
  protected findUser(_username: string, steps: string[]): boolean {
    steps.push("User found in LDAP");
    return true;
  }
  protected verifyPassword(_password: string, steps: string[]): boolean {
    steps.push("LDAP bind successful");
    return true;
  }
  protected onSuccess(username: string, steps: string[]): void {
    steps.push(`Session token generated for ${username}`);
  }
}

const dbAuth10 = new DatabaseAuth();
const dbResult10 = dbAuth10.authenticate({ username: "alice", password: "secret" });
console.assert(dbResult10.success === true);
console.assert(dbResult10.steps.length === 4);

const dbFail10 = dbAuth10.authenticate({ username: "alice", password: "" });
console.assert(dbFail10.success === false);

const ldap10 = new LdapAuth();
const ldapResult10 = ldap10.authenticate({ username: "bob", password: "pass" });
console.assert(ldapResult10.steps[3] === "Session token generated for bob");
console.log("Solution 10 passed");


// ============================================================================
// SOLUTION 11 — IMPLEMENT: Document export
// ============================================================================

abstract class DocumentExporter {
  export(title: string, sections: string[]): string {
    const formattedTitle = this.formatTitle(title);
    const formattedSections = this.formatSections(sections);
    const header = this.addHeader();
    const footer = this.addFooter();
    return [header, formattedTitle, ...formattedSections, footer]
      .filter((s) => s !== "")
      .join("\n");
  }

  protected abstract formatTitle(title: string): string;
  protected abstract formatSections(sections: string[]): string[];
  protected addHeader(): string { return ""; }
  protected addFooter(): string { return ""; }
}

class HtmlExporter extends DocumentExporter {
  protected formatTitle(title: string): string { return `<h1>${title}</h1>`; }
  protected formatSections(sections: string[]): string[] {
    return sections.map((s) => `<p>${s}</p>`);
  }
  protected addHeader(): string { return "<!DOCTYPE html>"; }
  protected addFooter(): string { return "</html>"; }
}

class MarkdownExporter extends DocumentExporter {
  protected formatTitle(title: string): string { return `# ${title}`; }
  protected formatSections(sections: string[]): string[] {
    return sections.map((s) => `- ${s}`);
  }
}

const html11 = new HtmlExporter();
const htmlOut11 = html11.export("Test", ["A", "B"]);
console.assert(htmlOut11.includes("<h1>Test</h1>"));
console.assert(htmlOut11.includes("<!DOCTYPE html>"));
console.assert(htmlOut11.includes("</html>"));

const md11 = new MarkdownExporter();
const mdOut11 = md11.export("Test", ["A", "B"]);
console.assert(mdOut11.includes("# Test"));
console.assert(mdOut11.includes("- A"));
console.assert(!mdOut11.includes("<!DOCTYPE"));
console.log("Solution 11 passed");


// ============================================================================
// SOLUTION 12 — IMPLEMENT: Data validation pipeline
// ============================================================================

abstract class ValidationPipeline<T> {
  validate(data: T): { valid: boolean; errors: string[] } {
    const sanitized = this.sanitize(data);
    const errors: string[] = [];

    const reqErr = this.checkRequired(sanitized);
    if (reqErr !== null) errors.push(reqErr);

    const fmtErr = this.checkFormat(sanitized);
    if (fmtErr !== null) errors.push(fmtErr);

    const bizErr = this.checkBusiness(sanitized);
    if (bizErr !== null) errors.push(bizErr);

    return { valid: errors.length === 0, errors };
  }

  protected sanitize(data: T): T { return data; }
  protected abstract checkRequired(data: T): string | null;
  protected abstract checkFormat(data: T): string | null;
  protected checkBusiness(_data: T): string | null { return null; }
}

class EmailValidator extends ValidationPipeline<string> {
  protected sanitize(data: string): string {
    return data.trim().toLowerCase();
  }
  protected checkRequired(data: string): string | null {
    return data.length === 0 ? "Email is required" : null;
  }
  protected checkFormat(data: string): string | null {
    const atIndex = data.indexOf("@");
    if (atIndex === -1) return "Email must contain @";
    const afterAt = data.slice(atIndex + 1);
    if (!afterAt.includes(".")) return "Email must have a domain with a dot";
    return null;
  }
  protected checkBusiness(data: string): string | null {
    const domain = data.split("@")[1];
    if (domain === "tempmail.com") return "Temporary email addresses not allowed";
    return null;
  }
}

class AgeValidator extends ValidationPipeline<number> {
  protected checkRequired(data: number): string | null {
    return Number.isNaN(data) ? "Age is required" : null;
  }
  protected checkFormat(data: number): string | null {
    if (Number.isNaN(data)) return null;
    return Number.isInteger(data) ? null : "Age must be an integer";
  }
  protected checkBusiness(data: number): string | null {
    if (Number.isNaN(data)) return null;
    if (data < 0 || data > 150) return "Age must be between 0 and 150";
    return null;
  }
}

const emailVal12 = new EmailValidator();
console.assert(emailVal12.validate("  Alice@Gmail.Com  ").valid === true);
console.assert(emailVal12.validate("").valid === false);
console.assert(emailVal12.validate("noatsign").valid === false);
console.assert(emailVal12.validate("user@tempmail.com").valid === false);

const ageVal12 = new AgeValidator();
console.assert(ageVal12.validate(25).valid === true);
console.assert(ageVal12.validate(NaN).valid === false);
console.assert(ageVal12.validate(3.5).valid === false);
console.assert(ageVal12.validate(-1).valid === false);
console.log("Solution 12 passed");


// ============================================================================
// Runner
// ============================================================================
console.log("\n========================================");
console.log("All Template Method solutions passed!");
console.log("========================================");
