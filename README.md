![Hero](./assets/imgs/hero.jpg)
# Demo Project For Contextual.io Leadership  
[Documentation](./assets/docs/corp/README.md) ↗️

# DropDocx

A document-intake and AI-enrichment system built on the Contextual.io platform (Node-RED-based visual flow editor). A caller submits a note and a supporting file; DropDocx stores both — the file as a **record-level attachment** — creates an `Intake Request` record, enriches it asynchronously with AI, and audits every state transition.

**Tenant:** `Interview-Elwood-Berry` · **Developer:** Elwood Berry · **Reviewer:** Ben Edwards

Evidence tags used throughout: **[Documented]** platform behavior, **[Observed]** confirmed live in-tenant, **[Proposed]** design not yet wired, **[Verify]** requires live-tenant confirmation.

---

## Executive Summary

DropDocx demonstrates an end-to-end event-driven intake pipeline on Contextual.io. It separates synchronous request handling (HTTP intake) from asynchronous processing (AI enrichment) and observation (change auditing), using record creation and record update as the event boundaries that drive downstream work.

The architecture is intentionally **acyclic**: record *insert* fires enrichment; record *update* fires the auditor; the auditor writes only to logs. This topology — not conditional logic — is the loop-prevention argument.

**Status (2026-07-22): the full pipeline is built, deployed, and verified end-to-end in the live tenant.** A submission flows: HTTP intake → record + attachment → insert trigger → AI enrichment via Claude → Patch write-back → `AI_PROCESSED` → update trigger → old-versus-new audit. All three flows lint clean (0 errors, 0 warnings).

### Use Case

An external submitter provides their name, email, a free-text note, and a supporting document. DropDocx:

1. Receives the multipart submission over HTTP and validates required fields. **[Observed]**
2. Creates an `Intake Request` record at status `RECEIVED`. **[Observed]**
3. Stores the uploaded file as a **record-level attachment**. **[Observed]**
4. Returns the record ID with a controlled `200`; invalid input returns a controlled `400`. **[Observed]**
5. Asynchronously enriches the record with an AI summary, category, and confidence, transitioning to `AI_PROCESSED` (or `AI_FAILED`). **[Observed]**
6. Audits the transition by comparing old-versus-new record state and logging the changed fields. **[Observed]**

---

## Components

### Object Types

#### Intake Request

**[Observed]** The single Object Type backing the system (version 9). It deliberately separates submitter-provided fields from system- and AI-generated fields.

| Field | Type | Source | Notes |
|---|---|---|---|
| `id` | string (uuid v4) | System | Primary key |
| `createdAt` | string (date-time) | System | Record creation timestamp |
| `submitterName` | string (1–100) | Submitter | Required |
| `submitterEmail` | string (email) | Submitter | Required |
| `note` | string (min 1) | Submitter | Required |
| `status` | enum | System | `RECEIVED` / `AI_PROCESSED` / `AI_FAILED` — required |
| `aiSummary` | string | AI (write-back) | **[Observed]** populated live |
| `aiCategory` | string | AI (write-back) | **[Observed]** populated live |
| `aiConfidence` | number (0–1) | AI (write-back) | **[Observed]** populated live |
| `aiProcessedAt` | string | AI (write-back) | **[Observed]** populated live |

`additionalProperties: false`, `primaryKey: id`. Required: `submitterName`, `submitterEmail`, `note`, `status`.

**Record-level attachments confirmed working.** **[Observed]** Attachment metadata appears on the record:

```json
"_metaData": { "attachments": { "count": 1, "ids": ["oMA1B5qxJW8MUeAPitgHZV"], "size": 171063 } }
```

The attachment object carries a `ref` binding it to the record:

```json
"ref": { "namespace": "native-object", "typeId": "intake-request", "instanceId": "<record uuid>" }
```

Storage path: `native-object/intake-request/{instanceId}/{attachmentId}`. A genuine record-level attachment — not a filename, URL, or base64 field.

Design decisions worth defending on camera:
- **Status lifecycle is minimal** — only states the implementation reliably sets.
- **AI fields namespaced (`ai*`)** so enrichment write-back is visually obvious in old-versus-new audit logs.
- **Schema drafted with SolutionAI Data Model, then verified manually** — "vibe-code the draft, craft the final."
- **AI output is non-deterministic.** Identical notes produced `aiCategory` values of `"test"` and `"test submission"` across runs. The design persists `aiConfidence` and validates output *shape*, not content.

---

### Triggers

| Section | Trigger | Target Agent | Status |
|---|---|---|---|
| Post-Insert | `DropDocx Intake Insert Trigger` | DropDocx AI Enrichment Agent | **[Observed]** Enabled, firing |
| Post-Update | `DropDocx Intake Update Trigger` | DropDocx Change Auditor Agent | **[Observed]** Enabled, firing |
| Post-Delete | — | — | none |

Exactly one trigger per section. **This matters:** an earlier build had the update trigger mistakenly placed under Post-Insert, producing two insert triggers that double-fired the enrichment agent — duplicate AI calls and duplicate writes on a single record, with nothing visibly "broken" on screen. Trigger placement is a correctness concern, not a labelling one.

---

### Flows

#### HTTP Intake — `dropdocx-http-intake`

**[Observed — lint clean]** Three complete paths.

**Path A — `GET /form`**
`Inject - Form Request` / `GET /form` → `Log - Form Requested` → `Form HTML` → `Log - Template` → `200 - Server Form`

HTML contract is non-negotiable: `method="POST" action="/submit"`, `enctype="multipart/form-data"`, field names `submitterName`, `submitterEmail`, `note`, file input `document`.

**Path B — `POST /submit`**
`POST /submit` → `Scope Intake Log` → `LOG — Submission Received` → `Validate Submission`
  → *(valid)* `Build Record Body` → `Create Intake Request` → `Upload Attachments` → `Build Response` → `LOG — Record Created` → `200 - Submission Accepted`
  → *(invalid)* `LOG — Validation Failed` → `400 - Bad Request`

**Path C — errors**
`Catch: all` → `Log - Error` → `Build Error Response` → `500 - Server Error`

Two error-test injects (`Error Test : Invalid Schema (500)`, `Error Test : Missing File (400)`) allow controlled failure demonstration without breaking the happy path.

**RESOLVED — multipart message shape** **[Observed]**
The uploaded file lands at **`msg.req.files`** as an **array** (multer-style), not a keyed object:

```javascript
msg.req.files[0] = { fieldname: "document", originalname: "hvac-fault-report.pdf",
                     mimetype: "application/pdf", buffer: Buffer(171063), size: 171063 }
```

Retrieval matches on fieldname rather than index — robust to field reordering:
```javascript
const file = (msg.req.files || []).find(f => f.fieldname === 'document');
```

Form text fields land at **both** `msg.payload` and `msg.req.body`.

**Create Object node** **[Observed]** — `Type Id: Intake Request`, `Input: msg.payload`. Note the reserved `msg` keys (`typeId`, `property`, `outputProperty`, `responseProperty`, …): if present as top-level `msg` properties they override node config. DropDocx's convention (`msg.input`, `msg.record`, `msg.ai`) avoids all of them.

Observed logging — scalar only, no binary:
```json
{"stage":"submission-received","submitter":"…","noteLength":80,
 "filename":"hvac-fault-report.pdf","mimetype":"application/pdf","size":171063}
{"success":true,"recordId":"…","attachmentId":"…"}
```

#### AI Enrichment — `dropdocx-ai-enrichment`

**[Observed — lint clean, working end-to-end]**

3 test injects → Event Start → Init Log Session → Extract Record
├─1→ INFO — Event Received → DEBUG — AI Input → AI Enrich → Validate AI Output
│ ├─ success → Patch — Apply AI Fields → INFO — Record Enriched → End Log Session → Event End
│ └─ failure → Patch — Mark AI_FAILED ─┐
└─2→ ────────────────────────────────────────┴→ WARN — Enrichment Failed → Event Error
Catch: all → ERROR — Enrichment Failure → Event Error

**RESOLVED — create-event envelope** **[Observed]**
The Post-Insert trigger delivers the record flat at **`msg.payload`** (duplicated at `msg.event`):

msg.payload = { submitterName, submitterEmail, note, status, id, _metaData }
msg.topic = "persistent://interview-elwood-berry/default/dropdocx-ai-enrichment-agent"
msg.headers = { x-kind: ["trigger"], x-subkind: ["post-insert"],
x-type-id: ["intake-request"], x-name: ["DropDocx Intake Insert Trigger"],
x-uri: ["native-object:intake-request/{id}"], x-log-correlation-id: [...] }

`x-subkind` is the reliable event-type discriminator (`post-insert` / `post-update`).

**RESOLVED — AI Generate response shape** **[Observed]**
The Generate node wraps the model output. The JSON string is at:
- `msg.ai.rawResponse.text` (top-level), or
- `msg.ai.rawResponse.steps[0].content[0].text` (canonical)

The wrapper also carries `usage`, `finishReason`, `model`, `providerId`, and the full provider request/response. **A naive `typeof raw === "string"` check fails** — `rawResponse` is always an object; the text must be extracted before `JSON.parse`.

**RESOLVED — Patch node contract** **[Observed]**
Patch requires an **RFC-6902 operations array**, not a plain object. Passing an object yields:
`Patch error: $ — Invalid input: expected array, received undefined`

| Node | Object Id | Input | Output |
|---|---|---|---|
| `Patch — Apply AI Fields` | `msg.record.id` | `msg.patchBody` | `msg.payload` |
| `Patch — Mark AI_FAILED` | `msg.record.id` | `msg.failBody` | `msg.patchFailResult` |

`add` for fields absent on a fresh record; `replace` for existing `status`:
```javascript
msg.patchBody = [
  { op:"add",     path:"/aiSummary",     value: result.summary },
  { op:"add",     path:"/aiCategory",    value: result.category },
  { op:"add",     path:"/aiConfidence",  value: conf },
  { op:"add",     path:"/aiProcessedAt", value: new Date().toISOString() },
  { op:"replace", path:"/status",        value:"AI_PROCESSED" }
];
```

**Prompt-injection control** **[Observed in production prompt]** — the note is wrapped in explicit `BEGIN/END SUBMITTED NOTE` markers with instructions to treat enclosed content as untrusted data, ignore embedded directives, not reveal system details, and not invent facts.

Verified result:
```json
{ "status": "AI_PROCESSED",
  "aiSummary": "A standardized test note used to verify form submission data.",
  "aiCategory": "test", "aiConfidence": 0.95,
  "aiProcessedAt": "2026-07-21T23:07:48.072Z" }
```
Round-trip ~3s from record creation.

#### Change Auditor — `dropdocx-change-auditor`

**[Observed — lint clean, working end-to-end]**

TEST — Valid Update Event / Event Start → Compare Old vs New → Route — Transition Type
├─1 ENRICHMENT → INFO — Enrichment Audited ─┐
├─2 FAILURE → WARN — Failure Audited ─┼→ Event End
└─3 otherwise → DEBUG — Other Update ─┘
Catch: all → ERROR — Auditor Failure → Event Error

**RESOLVED — update-event envelope** **[Observed]**
Unlike the insert event, the update event carries explicit old and new sections:

msg.payload.old = { …record state BEFORE the update… }
msg.payload.new = { …record state AFTER the update… }

This structural difference between insert and update envelopes is the core observation the challenge asks for.

**Discovered behavior:** the **attachment upload is itself an update** and fires the Post-Update trigger. A single submission therefore produces two auditor events — one for the attachment write (`RECEIVED → RECEIVED`, attachments 0→1) and one for enrichment (`RECEIVED → AI_PROCESSED`). The auditor classifies and routes both rather than filtering one out.

Verified audit output:
```json
{ "recordId": "fb9fe177-…",
  "statusFrom": "RECEIVED", "statusTo": "AI_PROCESSED",
  "changedFields": ["status","aiSummary","aiCategory","aiConfidence","aiProcessedAt"],
  "changes": [ { "field":"status", "from":"RECEIVED", "to":"AI_PROCESSED" },
               { "field":"aiSummary", "from":null, "to":"A standardized test note…" }, … ],
  "attachmentsChanged": false, "attachmentCount": 1,
  "changeCount": 5, "transitionType": "ENRICHMENT" }
```

`undefined → null` normalisation means "field did not previously exist" logs explicitly rather than vanishing from the JSON.

---

### Connections & AI Routes

#### AI Connection — `dropdocx-ai-anthropic` **[Observed]**
| Field | Value |
|---|---|
| Provider | Anthropic |
| Type | `public` |
| Endpoint | `https://api.anthropic.com/v1` |
| API Key | Encrypted in tenant Connection interface (`<ENCRYPTED>` in audit trail) |

Platform note surfaced in the UI: *additional headers apply to HTTP Nodes but are **not** used by AI Routes.* A manually-added `x-api-key` header is therefore redundant on the Route path.

#### AI Route — `dropdocx-ai-route` **[Observed]**
```json
{ "maxRetries": 2,
  "modelProviders": [ { "providerConnectionId": "dropdocx-ai-anthropic",
                        "model": "claude-opus-4-8" } ] }
```
Single provider — **same-provider retry, not cross-provider failover.** True failover would require a second AI Connection in the Route. Stated accurately rather than overclaimed.

#### AI Generate node — `AI Enrich` **[Observed]**
| Setting | Value |
|---|---|
| AI Route | `dropdocx-ai-route` |
| Input | `msg.ai.request` (object with `prompt` **or** `messages`) |
| Output | `msg.ai.rawResponse` |
| Response | `msg._response` |
| Timeout | 300000 ms |
| Source tab | Parallelism only (None / Ordered / Unordered) |

**[Observed] The Generate node exposes no structured-output / JSON-schema enforcement.** The original design assumed schema could be enforced at the gateway; that assumption was tested and is **incorrect for this node**. Output-contract enforcement is therefore performed in `Validate AI Output` via extract → parse → schema check → controlled failure routing.

---

### Agents

| Agent | Type | Status | Flow Version |
|---|---|---|---|
| `dropdocx-http-intake-agent` | HTTP-to-Flow | **[Observed]** Running | Current |
| `dropdocx-ai-enrichment-agent` | Event-to-Flow (`flow-topic`, ordered) | **[Observed]** Running | Current |
| `dropdocx-change-auditor-agent` | Event-to-Flow (`flow-topic`, ordered) | **[Observed]** Running | Current |

All on image `5.14.2-next.0`, Small instance, liveness timeout 50s.

**Operational note learned the hard way:** editing a flow does **not** update a running agent. The agent must be rebound to the new flow version **and restarted**. Several diagnostic cycles were lost to nodes that existed on canvas but not in the running agent.

**Log-level filtering:** `info` and `debug` Log Taps surface in the Flow Editor debug pane but **not** reliably in the running agent's log viewer (agent log level: `Info, Warn, Error`). Diagnostic captures on a live agent must be emitted at `warn` or `error` to be visible.

---

## AI Gateway Metrics **[Observed]**

| Metric | Value |
|---|---|
| Route health | 100% succeeded, 0 failed |
| Error rate | 0.0% |
| Avg latency | 2.05 s (P95 2.81 s) |
| Finish reasons | all `stop` |
| Provider / model | anthropic / `claude-opus-4-8` |

---

## Debugging Techniques That Worked

Reusable methods, worth discussing on camera:

1. **Keys-only shape inspection.** A Function node emitting *type and size* per property (`Buffer(171063 bytes)`, `string(len=80)`) rather than values — reveals structure without dumping binary. Located the multipart file path.
2. **Fail-loud guards.** `Extract Record` returns `Object.keys(msg)` in `errorContext.debug` on a miss, so the first failed run doubles as the envelope capture.
3. **Never `JSON.stringify(msg)` on an event message.** It throws `Converting circular structure to JSON` (logger/stream internals). Stringify a *specific property* only.
4. **Status as diagnostic signal.** A record stuck at `RECEIVED` proves the flow never reached a Patch; `AI_FAILED` proves the failure branch executed correctly. Status localises the fault before any log is read.
5. **Inject-node fault isolation.** Wiring an Inject directly into `Compare Old vs New` — bypassing `Event Start` — proved the flow logic worked while events weren't arriving, narrowing the fault to exactly one node.
6. **Scalar-only logging.** `noteLength: 80` rather than the note; `filename`/`mimetype`/`size` rather than the buffer.

---

## Notable Faults Found and Fixed

Each of these passed every configuration screen while silently breaking the system.

| Fault | Symptom | Root cause |
|---|---|---|
| **Event Start placeholder condition** | Auditor agent Running, current flow, Backlog 0, zero executions | Default JSONata `payload!='bar'` on `Event Start` silently rejected every inbound event. Clearing it flushed the queued backlog immediately. |
| **Update trigger under Post-Insert** | Duplicate AI calls and duplicate writes per record | Trigger named "Update" was created in the Post-Insert section — two insert triggers firing the same agent. |
| **Switch output crossover** | One message logged to both INFO and WARN simultaneously | Two wires dragged from the same output port instead of one per port. |
| **Patch body as object** | `Invalid input: expected array, received undefined` | Patch requires an RFC-6902 ops array; a plain object was supplied. |
| **`msg.record-id` vs `msg.record.id`** | Success-path patch targeted an undefined record | Hyphen instead of dot on the `Object Id` field of `Patch — Apply AI Fields`. |
| **Unreachable AI JSON** | `schema check failed` on well-formed model output | `rawResponse` is an object wrapper; the JSON text sits at `.text` / `.steps[0].content[0].text`. |

---

## Testing

| Flow | Fixture | Exercises |
|---|---|---|
| HTTP Intake | `Inject - Form Request` | Path A form serving |
| HTTP Intake | `Error Test : Invalid Schema (500)` | Catch → 500 |
| HTTP Intake | `Error Test : Missing File (400)` | Validation → 400 |
| Enrichment | `TEST — Valid Create Event` | Happy path through AI Generate |
| Enrichment | `TEST — Missing Record ID` | Extract Record id guard |
| Enrichment | `TEST — Malformed AI Output` | **[Open]** currently emits an epoch timestamp; needs to bypass to `Validate AI Output` with a malformed `msg.ai.rawResponse` to test the parse-failure branch deterministically |
| Auditor | `TEST — Valid Update Event` | Old/new comparison, ENRICHMENT routing |

---

## Challenge Coverage

| CR | Requirement | Status |
|---|---|---|
| CR-01 | Tenant naming | ✅ `Interview-Elwood-Berry` |
| CR-02 | HTTP Flow + Agent + file upload | ✅ **Observed** |
| CR-03 | Object Type + record-level attachment | ✅ **Observed** |
| CR-04 | Create trigger | ✅ **Observed** |
| CR-05 | Event Flow + Agent + Inject + AI Generate | ✅ **Observed** (one fixture open) |
| CR-06 | AI Connection + Route + Generate | ✅ **Observed** |
| CR-07 | Original record updated with AI results | ✅ **Observed** |
| CR-08 | Update trigger | ✅ **Observed** |
| CR-09 | Second Event Flow — old vs. new | ✅ **Observed** |
| CR-10 | Logging across levels | ✅ info / warn / debug / error placed and demonstrated |
| CR-11 | SolutionAI usage | 🟡 Used for schema; decision log to be preserved |
| CR-12 | Live end-to-end demo | 🟡 Pipeline complete; rehearsal pending |

**Approximately 95% complete.** All twelve platform requirements are built and verified live except the SolutionAI decision log and demo rehearsal.

---

## Remaining Work

1. **`TEST — Malformed AI Output`** — rewire to bypass `AI Enrich` with a pre-set malformed `msg.ai.rawResponse`, or rename to reflect what it actually tests.
2. **SolutionAI decision log** (CR-11) — preserve prompt → recommendation → accepted/modified/rejected for both Data Model and Flow editor usage.
3. **Stale fixture text** — `TEST — Valid Create Event` note still reads "Provisional fixture — replace with captured envelope."
4. **Optional enhancement** — enrichment currently reads the note only. Reading the attached PDF via a base64 content block in the `messages` array is designed but unbuilt; `_metaData.attachments.ids[0]` is the confirmed handle.
5. **Demo** — rehearse, invite `ben.edwards+review@contextual.io` as admin, stop agents to preserve trial credits.

---

*All **[Observed]** claims are backed by live tenant artifacts — agent logs, audit-trail PATCH records, node configuration screenshots, or record JSON captured 2026-07-21/22. **[Proposed]** items are design intent not yet wired.*