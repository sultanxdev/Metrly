# Metrly

Metrly is an **event-driven, multi-tenant backend system** for **usage metering, real-time quota enforcement, and billing-period aggregation** in SaaS platforms.

QuotaFlow treats **usage as a financial event**, not a log line.

---

## Why Metrly Exists

Modern SaaS products increasingly charge based on **usage** (API calls, tokens, jobs, events).  
The hard part is not payments — it is **correctness under failure**.

Common problems teams face:
- Double-counted usage due to retries
- Missing usage during traffic spikes
- Inconsistent quota enforcement across instances
- Late-arriving events corrupting billing
- No audit trail during customer disputes

QuotaFlow solves these problems **before billing happens**.

---

## Core Principles

- **Usage is immutable**
- **Aggregation is derived state**
- **Quotas must be enforceable in real time**
- **Failures must not corrupt revenue**
- **Replays must be safe**

If any of these break, the system is invalid.

---

No service directly queries another service’s database.

---

## Services Overview

### 1. Auth & Tenant Service
**Responsibility**
- Tenant lifecycle
- API key issuance
- Plan assignment

**Owns**
- Tenants
- API keys
- Plans

---

### 2. Quota Enforcement Service
**Responsibility**
- Real-time allow/deny decisions
- Rate limiting and quota checks

**Key Characteristics**
- Redis-backed counters
- Sliding window enforcement
- Soft and hard limits
- Fail-closed for hard limits

---

### 3. Usage Ingestion Service
**Responsibility**
- Accept usage events
- Enforce idempotency
- Publish immutable usage events

**Guarantees**
- At-least-once delivery
- No aggregation logic
- No pricing logic

---

### 4. Aggregation & Billing Service
**Responsibility**
- Consume usage events
- Aggregate by tenant and billing period
- Apply pricing rules
- Generate invoice-ready records

**Design Rules**
- Append-only storage
- Deterministic rebuilds
- Late-event reconciliation

Invoices are **derived**, not source of truth.

---

### 5. Notification & Webhook Service
**Responsibility**
- Quota warnings
- Quota exceeded alerts
- Invoice generated events

**Delivery**
- At-least-once
- Retry with backoff
- Dead-letter queues

---

## Event Model

### Core Events
- `usage.recorded`
- `quota.warning`
- `quota.exceeded`
- `billing.period.closed`
- `invoice.generated`

### Event Rules
- Events are immutable
- Schemas are versioned
- Partitioned by `tenant_id`
- Safe for replay

---

## Consistency Model

| Component              | Guarantee              |
|------------------------|------------------------|
| Quota checks           | Eventually consistent  |
| Usage ingestion        | At-least-once          |
| Aggregation            | Idempotent             |
| Invoices               | Immutable once closed  |
| Notifications          | At-least-once          |

Exactly-once end-to-end delivery is **not claimed**.

---

## Failure Handling (Explicit)

| Failure Scenario                  | Behavior |
|----------------------------------|----------|
| Duplicate usage event            | Deduplicated via idempotency keys |
| Broker outage                    | Backpressure, no data loss |
| Aggregation service crash        | Safe replay from events |
| Late usage after invoice close   | Reconciliation adjustment |
| Quota cache desync               | Conservative enforcement |
| Plan change mid-cycle            | Effective next window |

Failures delay billing — they **never corrupt it**.

---

## Tech Stack

- API: Node.js / Go
- Database: PostgreSQL (per service)
- Cache: Redis
- Messaging: Kafka or RabbitMQ
- Auth: API keys + JWT
- Infra: Docker Compose

Kubernetes is intentionally out of scope.

---

## What Metrly Is NOT

- Not a payment processor
- Not a Stripe replacement
- Not an analytics dashboard
- Not a UI-heavy SaaS

QuotaFlow is **backend infrastructure**.

---

## Local Development

```bash
docker-compose up -d


QuotaFlow is built as **event-driven microservices** with explicit ownership boundaries.

