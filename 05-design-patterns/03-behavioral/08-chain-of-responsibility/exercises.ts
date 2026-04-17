// ============================================================================
// Chain of Responsibility Pattern — Exercises
// Config: ES2022, strict, ESNext modules. Run: npx tsx exercises.ts
// ============================================================================

// ============================================================================
// EXERCISE 1 — PREDICT: Basic chain execution
// What does this print?
// ============================================================================

interface Handler {
  setNext(handler: Handler): Handler;
  handle(value: number): string;
}

abstract class BaseHandler implements Handler {
  private next: Handler | null = null;

  setNext(handler: Handler): Handler {
    this.next = handler;
    return handler;
  }

  handle(value: number): string {
    if (this.next) {
      return this.next.handle(value);
    }
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

// const small = new SmallHandler();
// const medium = new MediumHandler();
// const large = new LargeHandler();
// small.setNext(medium).setNext(large);
//
// console.log(small.handle(5));
// console.log(small.handle(50));
// console.log(small.handle(500));
// console.log(small.handle(-1));

// YOUR PREDICTION:
// ____________________________________________


// ============================================================================
// EXERCISE 2 — PREDICT: Pipeline variant (all handlers execute)
// What does this print?
// ============================================================================

interface PipeHandler {
  setNext(handler: PipeHandler): PipeHandler;
  handle(data: string[]): string[];
}

abstract class BasePipeHandler implements PipeHandler {
  private next: PipeHandler | null = null;

  setNext(handler: PipeHandler): PipeHandler {
    this.next = handler;
    return handler;
  }

  handle(data: string[]): string[] {
    if (this.next) {
      return this.next.handle(data);
    }
    return data;
  }
}

class TrimHandler extends BasePipeHandler {
  handle(data: string[]): string[] {
    const trimmed = data.map((s) => s.trim());
    return super.handle(trimmed);
  }
}

class UpperHandler extends BasePipeHandler {
  handle(data: string[]): string[] {
    const uppered = data.map((s) => s.toUpperCase());
    return super.handle(uppered);
  }
}

class FilterEmptyHandler extends BasePipeHandler {
  handle(data: string[]): string[] {
    const filtered = data.filter((s) => s.length > 0);
    return super.handle(filtered);
  }
}

// const trim = new TrimHandler();
// const upper = new UpperHandler();
// const filter = new FilterEmptyHandler();
// trim.setNext(upper).setNext(filter);
//
// console.log(trim.handle(["  hello  ", "", " world ", "  "]));

// YOUR PREDICTION:
// ____________________________________________


// ============================================================================
// EXERCISE 3 — PREDICT: Short-circuit behavior
// What does this print?
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

// const tokenCheck = new TokenCheck();
// const roleCheck = new RoleCheck();
// const bodyCheck = new BodyCheck();
// tokenCheck.setNext(roleCheck).setNext(bodyCheck);
//
// console.log(tokenCheck.handle({ token: "", role: "admin", body: "data" }));
// console.log(tokenCheck.handle({ token: "abc", role: "user", body: "data" }));
// console.log(tokenCheck.handle({ token: "abc", role: "admin", body: "" }));
// console.log(tokenCheck.handle({ token: "abc", role: "admin", body: "data" }));

// YOUR PREDICTION:
// ____________________________________________


// ============================================================================
// EXERCISE 4 — PREDICT: Chain with no handlers matching
// What does this print?
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

// const even = new EvenHandler();
// const positive = new PositiveHandler();
// even.setNext(positive);
//
// console.log(even.handle(4));
// console.log(even.handle(7));
// console.log(even.handle(-3));
// console.log(even.handle(0));

// YOUR PREDICTION:
// ____________________________________________


// ============================================================================
// EXERCISE 5 — FIX: Chain wiring is broken
// The handlers don't pass to the next handler properly.
// ============================================================================

interface DiscountHandler {
  setNext(handler: DiscountHandler): DiscountHandler;
  calculate(amount: number): number;
}

class BulkDiscount implements DiscountHandler {
  private next: DiscountHandler | null = null;

  setNext(handler: DiscountHandler): DiscountHandler {
    this.next = handler;
    return handler;
  }

  calculate(amount: number): number {
    if (amount > 1000) {
      amount = amount * 0.9; // 10% off
    }
    // BUG: should pass to next handler but doesn't
    return amount;
  }
}

class SeasonalDiscount implements DiscountHandler {
  private next: DiscountHandler | null = null;

  setNext(handler: DiscountHandler): DiscountHandler {
    this.next = handler;
    return handler;
  }

  calculate(amount: number): number {
    amount = amount * 0.95; // 5% seasonal discount always applies
    // BUG: should pass to next handler but doesn't
    return amount;
  }
}

class CouponDiscount implements DiscountHandler {
  private next: DiscountHandler | null = null;

  setNext(handler: DiscountHandler): DiscountHandler {
    this.next = handler;
    return handler;
  }

  calculate(amount: number): number {
    amount = amount - 50; // flat $50 off
    // BUG: should pass to next handler but doesn't
    return amount;
  }
}

// FIX: Each handler should delegate to next after applying its discount.
// If no next handler, return the current amount.

// TEST:
// const bulk = new BulkDiscount();
// const seasonal = new SeasonalDiscount();
// const coupon = new CouponDiscount();
// bulk.setNext(seasonal).setNext(coupon);
//
// // $2000 → bulk: 2000*0.9=1800 → seasonal: 1800*0.95=1710 → coupon: 1710-50=1660
// const result = bulk.calculate(2000);
// console.assert(result === 1660, `Expected 1660, got ${result}`);
//
// // $500 → bulk: no discount → seasonal: 500*0.95=475 → coupon: 475-50=425
// const result2 = bulk.calculate(500);
// console.assert(result2 === 425, `Expected 425, got ${result2}`);
// console.log("Exercise 5 passed");


// ============================================================================
// EXERCISE 6 — FIX: Handler handle() doesn't call super properly
// and chain construction is in wrong order
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
    // BUG: should collect this handler's result AND delegate to next
    if (this.next) {
      return this.next.handle(entry);
    }
    return [];
  }

  protected abstract process(entry: LogEntry): string | null;
}

class ErrorLogHandler extends LogHandler {
  protected process(entry: LogEntry): string | null {
    if (entry.level === "error") return `[ERROR] ${entry.message}`;
    return null;
  }

  // BUG: doesn't use process() or pass to next
  handle(entry: LogEntry): string[] {
    const result = this.process(entry);
    return result ? [result] : [];
  }
}

class WarnLogHandler extends LogHandler {
  protected process(entry: LogEntry): string | null {
    if (entry.level === "warn") return `[WARN] ${entry.message}`;
    return null;
  }

  // BUG: same issue
  handle(entry: LogEntry): string[] {
    const result = this.process(entry);
    return result ? [result] : [];
  }
}

class InfoLogHandler extends LogHandler {
  protected process(entry: LogEntry): string | null {
    if (entry.level === "info") return `[INFO] ${entry.message}`;
    return null;
  }

  // BUG: same issue
  handle(entry: LogEntry): string[] {
    const result = this.process(entry);
    return result ? [result] : [];
  }
}

// FIX: Each handler should:
// 1. Call this.process(entry) and include the result if non-null
// 2. Delegate to super.handle(entry) to continue the chain
// 3. Combine both results
// The chain should be: error → warn → info (pipeline style)

// TEST:
// const errorH = new ErrorLogHandler();
// const warnH = new WarnLogHandler();
// const infoH = new InfoLogHandler();
// errorH.setNext(warnH).setNext(infoH);
//
// const errResult = errorH.handle({ level: "error", message: "Crash" });
// console.assert(errResult.length === 1 && errResult[0] === "[ERROR] Crash");
//
// const warnResult = errorH.handle({ level: "warn", message: "Slow" });
// console.assert(warnResult.length === 1 && warnResult[0] === "[WARN] Slow");
//
// const infoResult = errorH.handle({ level: "info", message: "Started" });
// console.assert(infoResult.length === 1 && infoResult[0] === "[INFO] Started");
//
// const debugResult = errorH.handle({ level: "debug", message: "Trace" });
// console.assert(debugResult.length === 0);
// console.log("Exercise 6 passed");


// ============================================================================
// EXERCISE 7 — IMPLEMENT: Support ticket routing chain
// ============================================================================

// Requirements:
// - Interface `TicketHandler` with setNext and handle methods
// - `handle(ticket: { priority: "low" | "medium" | "high" | "critical"; issue: string }): string`
// - Returns a string describing who handled it, or "Unhandled" if nobody handles it
//
// Handlers (exclusive — first match handles):
// - `BotHandler`: handles "low" priority → "Bot: Auto-replied to: {issue}"
// - `SupportHandler`: handles "medium" → "Support Agent: Handling: {issue}"
// - `ManagerHandler`: handles "high" → "Manager: Escalated: {issue}"
// - `CtoHandler`: handles "critical" → "CTO: Emergency response: {issue}"
//
// Chain order: Bot → Support → Manager → CTO

// YOUR IMPLEMENTATION HERE:


// TEST:
// const bot = new BotHandler();
// const support = new SupportHandler();
// const manager = new ManagerHandler();
// const cto = new CtoHandler();
// bot.setNext(support).setNext(manager).setNext(cto);
//
// console.assert(bot.handle({ priority: "low", issue: "FAQ" }) === "Bot: Auto-replied to: FAQ");
// console.assert(bot.handle({ priority: "medium", issue: "Bug" }) === "Support Agent: Handling: Bug");
// console.assert(bot.handle({ priority: "high", issue: "Outage" }) === "Manager: Escalated: Outage");
// console.assert(bot.handle({ priority: "critical", issue: "Data loss" }) === "CTO: Emergency response: Data loss");
// console.log("Exercise 7 passed");


// ============================================================================
// EXERCISE 8 — IMPLEMENT: HTTP middleware chain (pipeline variant)
// ============================================================================

// Requirements:
// - Interface `Middleware` with setNext and process methods
// - `process(context: HttpContext): HttpContext`
// - `HttpContext = { headers: Record<string, string>; body: string; logs: string[]; blocked: boolean }`
// - Each middleware mutates/enriches context and passes it along (pipeline style)
// - If `blocked` is true, subsequent handlers should NOT process but still pass along
//
// Middlewares:
// - `CorsMiddleware`: adds header "Access-Control-Allow-Origin": "*", logs "CORS headers added"
// - `AuthMiddleware`: if headers["authorization"] is missing, set blocked=true and log "Auth: blocked"
//   otherwise log "Auth: passed"
// - `LoggingMiddleware`: logs "Request logged" (always, even if blocked)
//
// Chain: CORS → Auth → Logging

// YOUR IMPLEMENTATION HERE:


// TEST:
// const cors = new CorsMiddleware();
// const auth = new AuthMiddleware();
// const logging = new LoggingMiddleware();
// cors.setNext(auth).setNext(logging);
//
// const ctx1 = cors.process({
//   headers: { authorization: "Bearer token" },
//   body: "data",
//   logs: [],
//   blocked: false,
// });
// console.assert(ctx1.headers["Access-Control-Allow-Origin"] === "*");
// console.assert(ctx1.logs.includes("CORS headers added"));
// console.assert(ctx1.logs.includes("Auth: passed"));
// console.assert(ctx1.logs.includes("Request logged"));
// console.assert(ctx1.blocked === false);
//
// const ctx2 = cors.process({
//   headers: {},
//   body: "data",
//   logs: [],
//   blocked: false,
// });
// console.assert(ctx2.blocked === true);
// console.assert(ctx2.logs.includes("Auth: blocked"));
// console.assert(ctx2.logs.includes("Request logged")); // logging still runs
// console.log("Exercise 8 passed");


// ============================================================================
// EXERCISE 9 — IMPLEMENT: Validation chain with error collection
// ============================================================================

// Requirements:
// - Abstract class `Validator` with setNext and validate methods
// - `validate(value: string): string[]` — returns array of error messages (empty = valid)
// - Pipeline variant: ALL validators run, errors are collected from each
// - Each concrete validator returns its own error or empty string, then delegates to next
//
// Validators:
// - `RequiredValidator`: error "Value is required" if empty
// - `MinLengthValidator(min: number)`: error "Minimum length is {min}" if value.length < min
// - `PatternValidator(pattern: RegExp, message: string)`: error `message` if value doesn't match pattern
//
// Chain: Required → MinLength(3) → Pattern(/^[a-z]+$/, "Only lowercase letters allowed")

// YOUR IMPLEMENTATION HERE:


// TEST:
// const required = new RequiredValidator();
// const minLen = new MinLengthValidator(3);
// const pattern = new PatternValidator(/^[a-z]+$/, "Only lowercase letters allowed");
// required.setNext(minLen).setNext(pattern);
//
// console.assert(required.validate("hello").length === 0);
// console.assert(required.validate("").length >= 1); // at least "required" error
// console.assert(required.validate("ab").length >= 1); // min length error
// console.assert(required.validate("AB").length >= 1); // pattern error
// console.assert(required.validate("a").length >= 1); // min length error
// console.log("Exercise 9 passed");


// ============================================================================
// EXERCISE 10 — IMPLEMENT: Purchase approval chain
// ============================================================================

// Requirements:
// - Interface `Approver` with setNext and approve methods
// - `approve(amount: number): { approved: boolean; approver: string }`
// - Exclusive variant: first handler that CAN approve does so
// - If no one can approve, return { approved: false, approver: "None" }
//
// Approvers:
// - `TeamLead`: approves amounts < 100, approver name "Team Lead"
// - `Manager`: approves amounts < 1000, approver name "Manager"
// - `Director`: approves amounts < 10000, approver name "Director"
// - `Ceo`: approves any amount, approver name "CEO"
//
// Chain: TeamLead → Manager → Director → CEO

// YOUR IMPLEMENTATION HERE:


// TEST:
// const lead = new TeamLead();
// const mgr = new Manager();
// const dir = new Director();
// const ceo = new Ceo();
// lead.setNext(mgr).setNext(dir).setNext(ceo);
//
// console.assert(lead.approve(50).approver === "Team Lead");
// console.assert(lead.approve(500).approver === "Manager");
// console.assert(lead.approve(5000).approver === "Director");
// console.assert(lead.approve(50000).approver === "CEO");
// console.assert(lead.approve(50).approved === true);
// console.log("Exercise 10 passed");


// ============================================================================
// EXERCISE 11 — IMPLEMENT: Event bubbling simulation
// ============================================================================

// Requirements:
// - Class `UIComponent` with a name, optional parent, and an `onClick(event: string): string[]`
// - When clicked, the component logs "{name} received: {event}"
// - If the component has a parent, the event bubbles up (parent also handles it)
// - Return an array of all log entries from this component up to root
// - Method `stopPropagation()` sets a flag so the event does NOT bubble to parent
//
// Build this tree:
// - App (root)
//   - Panel
//     - Button
//
// When Button is clicked, event should bubble: Button → Panel → App
// If Panel calls stopPropagation, event stops at Panel

// YOUR IMPLEMENTATION HERE:


// TEST:
// const app = new UIComponent("App");
// const panel = new UIComponent("Panel", app);
// const button = new UIComponent("Button", panel);
//
// const result1 = button.onClick("click");
// console.assert(result1.length === 3);
// console.assert(result1[0] === "Button received: click");
// console.assert(result1[1] === "Panel received: click");
// console.assert(result1[2] === "App received: click");
//
// panel.stopPropagation();
// const result2 = button.onClick("click");
// console.assert(result2.length === 2);
// console.assert(result2[1] === "Panel received: click");
// console.log("Exercise 11 passed");


// ============================================================================
// EXERCISE 12 — IMPLEMENT: Configurable rate limiter chain
// ============================================================================

// Requirements:
// - Abstract class `RateLimitHandler` with setNext and check methods
// - `check(request: { ip: string; userId: string; timestamp: number }): { allowed: boolean; reason: string }`
// - Exclusive variant: first handler that REJECTS stops the chain
// - If all handlers pass, return { allowed: true, reason: "OK" }
//
// Handlers:
// - `IpRateLimiter(maxPerIp: number)`: tracks request count per IP.
//   If count > maxPerIp, reject with reason "IP rate limit exceeded".
//   Each call to check increments the counter.
// - `UserRateLimiter(maxPerUser: number)`: same but per userId.
//   Reason: "User rate limit exceeded"
// - `GlobalRateLimiter(maxTotal: number)`: tracks total request count.
//   Reason: "Global rate limit exceeded"
//
// Chain: IP(3) → User(2) → Global(10)

// YOUR IMPLEMENTATION HERE:


// TEST:
// const ipLimiter = new IpRateLimiter(3);
// const userLimiter = new UserRateLimiter(2);
// const globalLimiter = new GlobalRateLimiter(10);
// ipLimiter.setNext(userLimiter).setNext(globalLimiter);
//
// const req = { ip: "1.1.1.1", userId: "alice", timestamp: Date.now() };
// console.assert(ipLimiter.check(req).allowed === true);  // ip:1, user:1, global:1
// console.assert(ipLimiter.check(req).allowed === true);  // ip:2, user:2, global:2
// const res3 = ipLimiter.check(req);
// console.assert(res3.allowed === false); // user:3 > 2 → rejected
// console.assert(res3.reason === "User rate limit exceeded");
//
// const req2 = { ip: "2.2.2.2", userId: "bob", timestamp: Date.now() };
// console.assert(ipLimiter.check(req2).allowed === true);
// console.log("Exercise 12 passed");
