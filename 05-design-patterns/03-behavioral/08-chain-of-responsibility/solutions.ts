// ============================================================================
// Chain of Responsibility Pattern — Solutions
// Config: ES2022, strict, ESNext modules. Run: npx tsx solutions.ts
// ============================================================================

// ============================================================================
// SOLUTION 1 — PREDICT
// Output:
// "Small handled 5"      (5 < 10)
// "Medium handled 50"    (50 < 100, not < 10)
// "Large handled 500"    (500 >= 100)
// "Small handled -1"     (-1 < 10)
// ============================================================================

interface Handler {
  setNext(handler: Handler): Handler;
  handle(value: number): string;
}

abstract class BaseHandler implements Handler {
  private next: Handler | null = null;
  setNext(handler: Handler): Handler { this.next = handler; return handler; }
  handle(value: number): string {
    if (this.next) return this.next.handle(value);
    return "Unhandled";
  }
}

class SmallHandler extends BaseHandler {
  handle(value: number): string {
    if (value < 10) return `Small handled ${value}`;
    return super.handle(value);
  }
}

class MediumHandler extends BaseHandler {
  handle(value: number): string {
    if (value < 100) return `Medium handled ${value}`;
    return super.handle(value);
  }
}

class LargeHandler extends BaseHandler {
  handle(value: number): string {
    if (value >= 100) return `Large handled ${value}`;
    return super.handle(value);
  }
}

const small1 = new SmallHandler();
const medium1 = new MediumHandler();
const large1 = new LargeHandler();
small1.setNext(medium1).setNext(large1);

console.log("Solution 1:");
console.log(small1.handle(5));
console.log(small1.handle(50));
console.log(small1.handle(500));
console.log(small1.handle(-1));


// ============================================================================
// SOLUTION 2 — PREDICT
// Output: ["HELLO", "WORLD"]
// Trim: ["hello", "", "world", ""] → Upper: ["HELLO", "", "WORLD", ""]
// → FilterEmpty: ["HELLO", "WORLD"]
// ============================================================================

interface PipeHandler {
  setNext(handler: PipeHandler): PipeHandler;
  handle(data: string[]): string[];
}

abstract class BasePipeHandler implements PipeHandler {
  private next: PipeHandler | null = null;
  setNext(handler: PipeHandler): PipeHandler { this.next = handler; return handler; }
  handle(data: string[]): string[] {
    if (this.next) return this.next.handle(data);
    return data;
  }
}

class TrimHandler extends BasePipeHandler {
  handle(data: string[]): string[] {
    return super.handle(data.map((s) => s.trim()));
  }
}

class UpperHandler extends BasePipeHandler {
  handle(data: string[]): string[] {
    return super.handle(data.map((s) => s.toUpperCase()));
  }
}

class FilterEmptyHandler extends BasePipeHandler {
  handle(data: string[]): string[] {
    return super.handle(data.filter((s) => s.length > 0));
  }
}

const trim2 = new TrimHandler();
const upper2 = new UpperHandler();
const filter2 = new FilterEmptyHandler();
trim2.setNext(upper2).setNext(filter2);
console.log("Solution 2:", trim2.handle(["  hello  ", "", " world ", "  "]));


// ============================================================================
// SOLUTION 3 — PREDICT
// "REJECTED: No token"       (empty token → short-circuit at TokenCheck)
// "REJECTED: Not admin"      (role is "user" → short-circuit at RoleCheck)
// "REJECTED: Empty body"     (empty body → short-circuit at BodyCheck)
// "Request processed"        (all checks pass → end of chain default)
// ============================================================================

interface AuthRequest {
  token: string;
  role: string;
  body: string;
}

interface AuthHandler2 {
  setNext(h: AuthHandler2): AuthHandler2;
  handle(req: AuthRequest): string;
}

abstract class BaseAuthHandler implements AuthHandler2 {
  private next: AuthHandler2 | null = null;
  setNext(h: AuthHandler2): AuthHandler2 { this.next = h; return h; }
  handle(req: AuthRequest): string {
    if (this.next) return this.next.handle(req);
    return "Request processed";
  }
}

class TokenCheck extends BaseAuthHandler {
  handle(req: AuthRequest): string {
    if (!req.token) return "REJECTED: No token";
    return super.handle(req);
  }
}

class RoleCheck extends BaseAuthHandler {
  handle(req: AuthRequest): string {
    if (req.role !== "admin") return "REJECTED: Not admin";
    return super.handle(req);
  }
}

class BodyCheck extends BaseAuthHandler {
  handle(req: AuthRequest): string {
    if (!req.body) return "REJECTED: Empty body";
    return super.handle(req);
  }
}

const tokenCheck3 = new TokenCheck();
const roleCheck3 = new RoleCheck();
const bodyCheck3 = new BodyCheck();
tokenCheck3.setNext(roleCheck3).setNext(bodyCheck3);

console.log("Solution 3:");
console.log(tokenCheck3.handle({ token: "", role: "admin", body: "data" }));
console.log(tokenCheck3.handle({ token: "abc", role: "user", body: "data" }));
console.log(tokenCheck3.handle({ token: "abc", role: "admin", body: "" }));
console.log(tokenCheck3.handle({ token: "abc", role: "admin", body: "data" }));


// ============================================================================
// SOLUTION 4 — PREDICT
// "Even: 4"        (4 is even and > 0)
// "Positive: 7"    (7 is not even, but is positive → next handler)
// "Unhandled"      (-3 is not even, not positive → falls through)
// "Unhandled"      (0 is even but not > 0, and not > 0 → falls through)
// ============================================================================

class EvenHandler extends BaseHandler {
  handle(value: number): string {
    if (value % 2 === 0 && value > 0) return `Even: ${value}`;
    return super.handle(value);
  }
}

class PositiveHandler extends BaseHandler {
  handle(value: number): string {
    if (value > 0) return `Positive: ${value}`;
    return super.handle(value);
  }
}

const even4 = new EvenHandler();
const positive4 = new PositiveHandler();
even4.setNext(positive4);

console.log("Solution 4:");
console.log(even4.handle(4));
console.log(even4.handle(7));
console.log(even4.handle(-3));
console.log(even4.handle(0));


// ============================================================================
// SOLUTION 5 — FIX: Each handler delegates to next after applying discount
// ============================================================================

interface DiscountHandler {
  setNext(handler: DiscountHandler): DiscountHandler;
  calculate(amount: number): number;
}

class BulkDiscount implements DiscountHandler {
  private next: DiscountHandler | null = null;
  setNext(handler: DiscountHandler): DiscountHandler { this.next = handler; return handler; }
  calculate(amount: number): number {
    if (amount > 1000) amount = amount * 0.9;
    if (this.next) return this.next.calculate(amount);
    return amount;
  }
}

class SeasonalDiscount implements DiscountHandler {
  private next: DiscountHandler | null = null;
  setNext(handler: DiscountHandler): DiscountHandler { this.next = handler; return handler; }
  calculate(amount: number): number {
    amount = amount * 0.95;
    if (this.next) return this.next.calculate(amount);
    return amount;
  }
}

class CouponDiscount implements DiscountHandler {
  private next: DiscountHandler | null = null;
  setNext(handler: DiscountHandler): DiscountHandler { this.next = handler; return handler; }
  calculate(amount: number): number {
    amount = amount - 50;
    if (this.next) return this.next.calculate(amount);
    return amount;
  }
}

const bulk5 = new BulkDiscount();
const seasonal5 = new SeasonalDiscount();
const coupon5 = new CouponDiscount();
bulk5.setNext(seasonal5).setNext(coupon5);

const result5 = bulk5.calculate(2000);
console.assert(result5 === 1660, `Expected 1660, got ${result5}`);
const result5b = bulk5.calculate(500);
console.assert(result5b === 425, `Expected 425, got ${result5b}`);
console.log("Solution 5 passed");


// ============================================================================
// SOLUTION 6 — FIX: Handlers process and delegate to chain
// ============================================================================

interface LogEntry {
  level: "debug" | "info" | "warn" | "error";
  message: string;
}

abstract class LogHandler {
  private next: LogHandler | null = null;

  setNext(handler: LogHandler): LogHandler {
    this.next = handler;
    return handler;
  }

  handle(entry: LogEntry): string[] {
    const result = this.process(entry);
    const current = result ? [result] : [];
    if (this.next) {
      return [...current, ...this.next.handle(entry)];
    }
    return current;
  }

  protected abstract process(entry: LogEntry): string | null;
}

class ErrorLogHandler extends LogHandler {
  protected process(entry: LogEntry): string | null {
    if (entry.level === "error") return `[ERROR] ${entry.message}`;
    return null;
  }
}

class WarnLogHandler extends LogHandler {
  protected process(entry: LogEntry): string | null {
    if (entry.level === "warn") return `[WARN] ${entry.message}`;
    return null;
  }
}

class InfoLogHandler extends LogHandler {
  protected process(entry: LogEntry): string | null {
    if (entry.level === "info") return `[INFO] ${entry.message}`;
    return null;
  }
}

const errorH6 = new ErrorLogHandler();
const warnH6 = new WarnLogHandler();
const infoH6 = new InfoLogHandler();
errorH6.setNext(warnH6).setNext(infoH6);

const errResult6 = errorH6.handle({ level: "error", message: "Crash" });
console.assert(errResult6.length === 1 && errResult6[0] === "[ERROR] Crash");
const warnResult6 = errorH6.handle({ level: "warn", message: "Slow" });
console.assert(warnResult6.length === 1 && warnResult6[0] === "[WARN] Slow");
const infoResult6 = errorH6.handle({ level: "info", message: "Started" });
console.assert(infoResult6.length === 1 && infoResult6[0] === "[INFO] Started");
const debugResult6 = errorH6.handle({ level: "debug", message: "Trace" });
console.assert(debugResult6.length === 0);
console.log("Solution 6 passed");


// ============================================================================
// SOLUTION 7 — IMPLEMENT: Support ticket routing
// ============================================================================

interface Ticket {
  priority: "low" | "medium" | "high" | "critical";
  issue: string;
}

interface TicketHandler {
  setNext(handler: TicketHandler): TicketHandler;
  handle(ticket: Ticket): string;
}

abstract class BaseTicketHandler implements TicketHandler {
  private next: TicketHandler | null = null;
  setNext(handler: TicketHandler): TicketHandler { this.next = handler; return handler; }
  handle(ticket: Ticket): string {
    if (this.next) return this.next.handle(ticket);
    return "Unhandled";
  }
}

class BotHandler extends BaseTicketHandler {
  handle(ticket: Ticket): string {
    if (ticket.priority === "low") return `Bot: Auto-replied to: ${ticket.issue}`;
    return super.handle(ticket);
  }
}

class SupportHandler extends BaseTicketHandler {
  handle(ticket: Ticket): string {
    if (ticket.priority === "medium") return `Support Agent: Handling: ${ticket.issue}`;
    return super.handle(ticket);
  }
}

class ManagerHandler extends BaseTicketHandler {
  handle(ticket: Ticket): string {
    if (ticket.priority === "high") return `Manager: Escalated: ${ticket.issue}`;
    return super.handle(ticket);
  }
}

class CtoHandler extends BaseTicketHandler {
  handle(ticket: Ticket): string {
    if (ticket.priority === "critical") return `CTO: Emergency response: ${ticket.issue}`;
    return super.handle(ticket);
  }
}

const bot7 = new BotHandler();
const support7 = new SupportHandler();
const manager7 = new ManagerHandler();
const cto7 = new CtoHandler();
bot7.setNext(support7).setNext(manager7).setNext(cto7);

console.assert(bot7.handle({ priority: "low", issue: "FAQ" }) === "Bot: Auto-replied to: FAQ");
console.assert(bot7.handle({ priority: "medium", issue: "Bug" }) === "Support Agent: Handling: Bug");
console.assert(bot7.handle({ priority: "high", issue: "Outage" }) === "Manager: Escalated: Outage");
console.assert(bot7.handle({ priority: "critical", issue: "Data loss" }) === "CTO: Emergency response: Data loss");
console.log("Solution 7 passed");


// ============================================================================
// SOLUTION 8 — IMPLEMENT: HTTP middleware chain
// ============================================================================

interface HttpContext {
  headers: Record<string, string>;
  body: string;
  logs: string[];
  blocked: boolean;
}

interface Middleware {
  setNext(handler: Middleware): Middleware;
  process(context: HttpContext): HttpContext;
}

abstract class BaseMiddleware implements Middleware {
  private next: Middleware | null = null;
  setNext(handler: Middleware): Middleware { this.next = handler; return handler; }
  process(context: HttpContext): HttpContext {
    if (this.next) return this.next.process(context);
    return context;
  }
}

class CorsMiddleware extends BaseMiddleware {
  process(context: HttpContext): HttpContext {
    context.headers["Access-Control-Allow-Origin"] = "*";
    context.logs.push("CORS headers added");
    return super.process(context);
  }
}

class AuthMiddleware extends BaseMiddleware {
  process(context: HttpContext): HttpContext {
    if (!context.headers["authorization"]) {
      context.blocked = true;
      context.logs.push("Auth: blocked");
    } else {
      context.logs.push("Auth: passed");
    }
    return super.process(context);
  }
}

class LoggingMiddleware extends BaseMiddleware {
  process(context: HttpContext): HttpContext {
    context.logs.push("Request logged");
    return super.process(context);
  }
}

const cors8 = new CorsMiddleware();
const auth8 = new AuthMiddleware();
const logging8 = new LoggingMiddleware();
cors8.setNext(auth8).setNext(logging8);

const ctx8a = cors8.process({
  headers: { authorization: "Bearer token" },
  body: "data",
  logs: [],
  blocked: false,
});
console.assert(ctx8a.headers["Access-Control-Allow-Origin"] === "*");
console.assert(ctx8a.logs.includes("CORS headers added"));
console.assert(ctx8a.logs.includes("Auth: passed"));
console.assert(ctx8a.logs.includes("Request logged"));
console.assert(ctx8a.blocked === false);

const ctx8b = cors8.process({
  headers: {},
  body: "data",
  logs: [],
  blocked: false,
});
console.assert(ctx8b.blocked === true);
console.assert(ctx8b.logs.includes("Auth: blocked"));
console.assert(ctx8b.logs.includes("Request logged"));
console.log("Solution 8 passed");


// ============================================================================
// SOLUTION 9 — IMPLEMENT: Validation chain with error collection
// ============================================================================

abstract class Validator {
  private next: Validator | null = null;

  setNext(handler: Validator): Validator {
    this.next = handler;
    return handler;
  }

  validate(value: string): string[] {
    const error = this.check(value);
    const errors = error ? [error] : [];
    if (this.next) {
      return [...errors, ...this.next.validate(value)];
    }
    return errors;
  }

  protected abstract check(value: string): string | null;
}

class RequiredValidator extends Validator {
  protected check(value: string): string | null {
    return value.length === 0 ? "Value is required" : null;
  }
}

class MinLengthValidator extends Validator {
  constructor(private min: number) { super(); }
  protected check(value: string): string | null {
    return value.length < this.min ? `Minimum length is ${this.min}` : null;
  }
}

class PatternValidator extends Validator {
  constructor(private pattern: RegExp, private message: string) { super(); }
  protected check(value: string): string | null {
    return this.pattern.test(value) ? null : this.message;
  }
}

const required9 = new RequiredValidator();
const minLen9 = new MinLengthValidator(3);
const pattern9 = new PatternValidator(/^[a-z]+$/, "Only lowercase letters allowed");
required9.setNext(minLen9).setNext(pattern9);

console.assert(required9.validate("hello").length === 0);
console.assert(required9.validate("").length >= 1);
console.assert(required9.validate("ab").length >= 1);
console.assert(required9.validate("AB").length >= 1);
console.assert(required9.validate("a").length >= 1);
console.log("Solution 9 passed");


// ============================================================================
// SOLUTION 10 — IMPLEMENT: Purchase approval chain
// ============================================================================

interface ApprovalResult {
  approved: boolean;
  approver: string;
}

interface Approver {
  setNext(handler: Approver): Approver;
  approve(amount: number): ApprovalResult;
}

abstract class BaseApprover implements Approver {
  private next: Approver | null = null;
  setNext(handler: Approver): Approver { this.next = handler; return handler; }
  approve(amount: number): ApprovalResult {
    if (this.next) return this.next.approve(amount);
    return { approved: false, approver: "None" };
  }
}

class TeamLead extends BaseApprover {
  approve(amount: number): ApprovalResult {
    if (amount < 100) return { approved: true, approver: "Team Lead" };
    return super.approve(amount);
  }
}

class Manager extends BaseApprover {
  approve(amount: number): ApprovalResult {
    if (amount < 1000) return { approved: true, approver: "Manager" };
    return super.approve(amount);
  }
}

class Director extends BaseApprover {
  approve(amount: number): ApprovalResult {
    if (amount < 10000) return { approved: true, approver: "Director" };
    return super.approve(amount);
  }
}

class Ceo extends BaseApprover {
  approve(_amount: number): ApprovalResult {
    return { approved: true, approver: "CEO" };
  }
}

const lead10 = new TeamLead();
const mgr10 = new Manager();
const dir10 = new Director();
const ceo10 = new Ceo();
lead10.setNext(mgr10).setNext(dir10).setNext(ceo10);

console.assert(lead10.approve(50).approver === "Team Lead");
console.assert(lead10.approve(500).approver === "Manager");
console.assert(lead10.approve(5000).approver === "Director");
console.assert(lead10.approve(50000).approver === "CEO");
console.assert(lead10.approve(50).approved === true);
console.log("Solution 10 passed");


// ============================================================================
// SOLUTION 11 — IMPLEMENT: Event bubbling simulation
// ============================================================================

class UIComponent {
  private stopped = false;

  constructor(
    private name: string,
    private parent: UIComponent | null = null
  ) {}

  onClick(event: string): string[] {
    const log: string[] = [`${this.name} received: ${event}`];
    if (!this.stopped && this.parent) {
      log.push(...this.parent.onClick(event));
    }
    return log;
  }

  stopPropagation(): void {
    this.stopped = true;
  }
}

const app11 = new UIComponent("App");
const panel11 = new UIComponent("Panel", app11);
const button11 = new UIComponent("Button", panel11);

const result11a = button11.onClick("click");
console.assert(result11a.length === 3);
console.assert(result11a[0] === "Button received: click");
console.assert(result11a[1] === "Panel received: click");
console.assert(result11a[2] === "App received: click");

panel11.stopPropagation();
const result11b = button11.onClick("click");
console.assert(result11b.length === 2);
console.assert(result11b[1] === "Panel received: click");
console.log("Solution 11 passed");


// ============================================================================
// SOLUTION 12 — IMPLEMENT: Configurable rate limiter chain
// ============================================================================

interface RateLimitRequest {
  ip: string;
  userId: string;
  timestamp: number;
}

interface RateLimitResult {
  allowed: boolean;
  reason: string;
}

abstract class RateLimitHandler {
  private next: RateLimitHandler | null = null;

  setNext(handler: RateLimitHandler): RateLimitHandler {
    this.next = handler;
    return handler;
  }

  check(request: RateLimitRequest): RateLimitResult {
    if (this.next) return this.next.check(request);
    return { allowed: true, reason: "OK" };
  }
}

class IpRateLimiter extends RateLimitHandler {
  private counts = new Map<string, number>();

  constructor(private maxPerIp: number) { super(); }

  check(request: RateLimitRequest): RateLimitResult {
    const count = (this.counts.get(request.ip) ?? 0) + 1;
    this.counts.set(request.ip, count);
    if (count > this.maxPerIp) {
      return { allowed: false, reason: "IP rate limit exceeded" };
    }
    return super.check(request);
  }
}

class UserRateLimiter extends RateLimitHandler {
  private counts = new Map<string, number>();

  constructor(private maxPerUser: number) { super(); }

  check(request: RateLimitRequest): RateLimitResult {
    const count = (this.counts.get(request.userId) ?? 0) + 1;
    this.counts.set(request.userId, count);
    if (count > this.maxPerUser) {
      return { allowed: false, reason: "User rate limit exceeded" };
    }
    return super.check(request);
  }
}

class GlobalRateLimiter extends RateLimitHandler {
  private count = 0;

  constructor(private maxTotal: number) { super(); }

  check(request: RateLimitRequest): RateLimitResult {
    this.count++;
    if (this.count > this.maxTotal) {
      return { allowed: false, reason: "Global rate limit exceeded" };
    }
    return super.check(request);
  }
}

const ipLimiter12 = new IpRateLimiter(3);
const userLimiter12 = new UserRateLimiter(2);
const globalLimiter12 = new GlobalRateLimiter(10);
ipLimiter12.setNext(userLimiter12).setNext(globalLimiter12);

const req12 = { ip: "1.1.1.1", userId: "alice", timestamp: Date.now() };
console.assert(ipLimiter12.check(req12).allowed === true);
console.assert(ipLimiter12.check(req12).allowed === true);
const res12c = ipLimiter12.check(req12);
console.assert(res12c.allowed === false);
console.assert(res12c.reason === "User rate limit exceeded");
// 4th call: ip=4 > 3, rejected at IP level
const res12d = ipLimiter12.check(req12);
console.assert(res12d.allowed === false);
console.assert(res12d.reason === "IP rate limit exceeded");

const req12b = { ip: "2.2.2.2", userId: "bob", timestamp: Date.now() };
console.assert(ipLimiter12.check(req12b).allowed === true);
console.log("Solution 12 passed");


// ============================================================================
// Runner
// ============================================================================
console.log("\n========================================");
console.log("All Chain of Responsibility solutions passed!");
console.log("========================================");
