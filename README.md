![Hero](./assets/imgs/hero.jpg)
# Demo Project For Contextual.io Leadership  
[Documentation](./assets/docs/corp/README.md) ↗️

# DropDocx

A document-intake and AI-enrichment system built on the Contextual.io platform (Node-RED-based visual flow editor). A caller submits a note and a supporting file; DropDocx stores both — the file as a **record-level attachment** — creates an `Intake Request` record, enriches it asynchronously with AI, and audits every state transition.

**Tenant:** `Interview-Elwood-Berry` · **Developer:** Elwood Berry · **Reviewer:** Ben Edwards

Evidence tags used throughout: **[Documented]** platform behavior, **[Observed]** in tenant artifacts, **[Proposed]** design not yet wired, **[Verify]** requires live-tenant confirmation.

---

## Executive Summary

DropDocx demonstrates an end-to-end event-driven intake pipeline on Contextual.io. It separates synchronous request handling (HTTP intake) from asynchronous processing (AI enrichment) and observation (change auditing), using record creation and record update as the event boundaries that drive downstream work.

The architecture is intentionally **acyclic**: record *insert* fires enrichment; record *update* fires the auditor; the auditor writes only to trigger-less state. This topology — not conditional logic — is the loop-prevention argument.

### Use Case

An external submitter provides their name, email, a free-text note, and a supporting document. DropDocx:

1. Receives the multipart submission over HTTP and validates required fields.
2. Creates an `Intake Request` record at status `RECEIVED`.
3. Stores the uploaded file as a **record-level attachment** on that record (not a filename, URL, or base64 string).
4. Returns the new record ID to the caller with a controlled `201`; invalid input returns a controlled `400`.
5. Asynchronously enriches the record with an AI-generated summary, category, and confidence, transitioning it to `AI_PROCESSED` (or `AI_FAILED`).
6. Audits the enrichment transition by comparing old-versus-new record state.

The value proposition for a technical reviewer: every scored platform primitive — Object Types, HTTP Flow, record-level attachments, triggers, Event Flows, AI Generate, structured logging — is *materially* exercised rather than bolted on.

---

## Components

### Object Types

#### Intake Request

**[Observed — `01_data_model_schema.json`]** The single Object Type backing the system. It deliberately separates submitter-provided fields from system- and AI-generated fields.

| Field | Type | Source | Notes |
|---|---|---|---|
| `id` | string (uuid v4) | System-generated | Primary key |
| `createdAt` | string (date-time) | System-generated | Record creation timestamp |
| `submitterName` | string (1–100) | Submitter | Required |
| `submitterEmail` | string (email) | Submitter | Required |
| `note` | string (min 1) | Submitter | Required |
| `status` | enum | System | `RECEIVED` / `AI_PROCESSED` / `AI_FAILED` — required |
| `aiSummary` | string | AI (write-back) | Never written by submitter |
| `aiCategory` | string | AI (write-back) | |
| `aiConfidence` | number (0–1) | AI (write-back) | Self-reported confidence |
| `aiProcessedAt` | string | AI (write-back) | Enrichment completion timestamp |

`additionalProperties: false` and `primaryKey: id`. Required set: `submitterName`, `submitterEmail`, `note`, `status`.

Design decisions worth defending on camera:
- **Status lifecycle is minimal and demonstrable.** Only states the implementation can reliably set (`RECEIVED`, `AI_PROCESSED`, `AI_FAILED`) are included — no aspirational states.
- **AI fields are namespaced (`ai*`)** to make the enrichment write-back visually obvious in the record and in old-versus-new audit logs.
- **Schema was drafted with SolutionAI Data Model, then verified manually against the JSON** — "vibe-code the draft, craft the final."

**[Verify]** Record-level attachment support must be confirmed as enabled/available for this Object Type in-tenant before the attachment leg is considered complete.

---

### Flows

#### HTTP Intake — `dropdocx-http-intake`

**[Observed — `02_flow_dropdocxhttpintake.csv`, Path A/B configs]** Receives DropDocx submissions as multipart form data, validates, creates the record, attaches the file, and responds. Created `7/16/2026`, last updated `7/19/2026`.

The flow carries three paths:

**Path A — `GET /form`** *(confirmed configured)*
`HTTP In (/form)` → `Log` → `Template` → `HTTP Response (200)`.
Serves static form HTML. The HTML contract is non-negotiable: `method="POST" action="/submit"`, `enctype="multipart/form-data"`, field names `submitterName`, `submitterEmail`, `note`, and a file input named `document`. The `enctype` is what makes file transmission — and therefore CR-03 — possible.

**Path B — `POST /submit`** *(configured; two live-test markers open)*
`HTTP In (/submit, POST, accept uploads)` → `Log (info)` → `Function: Validate Submission` → `Change: Build Record Body` → `Create Object` → `Upload Attachment` → `Change: Build 201 Response` → `Log (info)` → `HTTP Response (201)`.

Message-path discipline is the story here:
- **Validation** (`Validate Submission`, 2 outputs) writes clean fields to a *protected* `msg.input.form` and the file reference to `msg.input.file`, so downstream nodes survive `msg.payload` overwrites. Output 1 = valid; Output 2 = invalid (pre-built 400 JSON body).
- **Build Record Body** merges the three validated fields with `{"status":"RECEIVED"}`, message-scoped to avoid leaking state across requests.
- **Create Object** writes the result to `msg.record` (not `msg.payload`) so the record ID survives to both the attachment node and the 201 body. **[Verify]** if the output path is not editable and `payload` is forced, adjust the response builder accordingly.
- **Upload Attachment** takes `Object ID = msg.record.id` and `Input = msg.input.file`, writing its result to a protected path — the mechanism that satisfies the record-level attachment requirement.

**Path C — error handling**
`Catch` → `Log (error)` → `HTTP Response (500)`, plus the controlled `400` branch fed by the validation node's second output.

Open **[Verify]** markers on this flow:
1. **File landing location** — where the uploaded `document` file actually lands on `msg` after the multipart POST (the `VERIFY-1` markers in `validate-submission.js`).
2. **Upload Attachment input shape** — the node's expected record-ID source and file reference, confirmed against a live upload.

#### DropDocx AI Enrichment — `dropdocx-ai-enrichment`

**[Proposed]** Event Flow bound to an Event-to-Flow Agent, subscribed to the `Intake Request` **insert** trigger topic. Responsibilities:
- Receive the create event; extract the record (`id`, `note`, submitter fields).
- Call **AI Generate** through a configured AI Route + AI Connection, using structured-output mode to enforce a JSON schema (`aiSummary`, `aiCategory`, `aiConfidence`) with platform-level retries and provider failover.
- Read the attached document via a base64 file content block in the `messages` array where the note alone is insufficient.
- **Patch** (not Put) the original record with the AI fields and `status = AI_PROCESSED`, so intake fields are untouched. On failure, set `AI_FAILED`.
- Inject-testable via a fixture reproducing the create event.

**[Verify]** The create-event envelope shape and record-data path must be captured live before fixtures are hard-coded.

#### DropDocx Change Auditor — `dropdocx-change-auditor`

**[Proposed]** Event Flow bound to an Event-to-Flow Agent, subscribed to the `Intake Request` **update** trigger topic. Responsibilities:
- Receive the update event; identify old-versus-new record sections.
- Compare and log selected changed fields (e.g. `status` `RECEIVED → AI_PROCESSED`, population of `aiSummary`).
- Write only to a **trigger-less** target (log output / audit sink) so it cannot re-fire itself — the terminal edge of the acyclic graph.

**[Verify]** The update-event envelope's old/new property paths (`msg.event.old` / `.new` or platform equivalent) must be observed in-tenant, not assumed.

---

### Agents

#### DropDocx HTTP Intake Agent

**[Proposed / Observed-adjacent]** An HTTP-to-Flow Agent binding `dropdocx-http-intake` and exposing the `/form` and `/submit` endpoints. Started for demonstration, stopped afterward to preserve trial credits.

Companion Event-to-Flow Agents (one per Event Flow above) bind `dropdocx-ai-enrichment` and `dropdocx-change-auditor` to their respective trigger topics. **[Verify]** Agent image version / sizing to be confirmed at deploy time.

---

## Records / Data

### Intake Request (records)

A record's lifecycle across the system:

1. **Created** by the HTTP Intake flow at `status = RECEIVED`, with submitter fields and `createdAt` populated and the document attached.
2. **Enriched** by the AI Enrichment flow: `aiSummary`, `aiCategory`, `aiConfidence`, `aiProcessedAt` populated; `status → AI_PROCESSED` (or `AI_FAILED`).
3. **Audited** by the Change Auditor flow, which logs the `RECEIVED → AI_PROCESSED` transition using old-versus-new values.

The uploaded document lives as a **record-level attachment** on the record — verifiable by inspecting the record in-tenant, not by reading a metadata field.

---

## What We Don't Know That We Need To Know

These items must be resolved by live-tenant testing or documentation before the build is demo-complete. They are flagged, not papered over.

1. **File landing location on `msg`** — where the uploaded `document` file actually appears after the multipart POST HTTP In node. Blocks completion of `validate-submission.js` (`VERIFY-1`) and the attachment leg. *Test: submit a real multipart POST, inspect the message with a scoped Debug/Log Tap.*
2. **Upload Attachment input contract** — the node's exact expected record-ID source and file-reference shape. *Test: run a live upload against a created record; inspect the attachment result and the record.*
3. **Create Object output path editability** — whether the created record can be written to `msg.record`, or whether `payload` is forced (which would require adjusting the attachment node and 201 response builder).
4. **Create-event envelope shape** — the structure and record-data path delivered to the enrichment Event Flow. *Test: capture a live insert event with an Inject-adjacent Log Tap before writing fixtures.*
5. **Update-event old/new paths** — the exact property paths for previous and updated record state in the update event. *Never guess `msg.event.old`/`.new`; observe it.*
6. **Record-level attachment enablement** — confirm the `Intake Request` Object Type supports/has attachments enabled in this tenant.
7. **Trigger topic naming/format** — the exact topics published by the insert and update triggers, and confirmation that the auditor's write target publishes to neither.
8. **AI Route / Connection specifics** — provider, model behavior, and structured-output enforcement as actually configured (secrets never in prompts, records, logs, or screenshots).
9. **Agent image version / sizing** — for each of the three Agents at deploy time.
10. **Validation 400 branch wiring** — confirm the validation node's second output is actually wired to the 400 response path (previously unwired), and resolve the Catch chain / relocate any floating Init Log Session node.

---

*Structural note:* HTTP Intake (Paths A/B) and its config are **[Observed]** from tenant artifacts. The two Event Flows and their Agents are **[Proposed]** designs on deck and are represented here at their intended-configuration state; treat any concrete claim about their runtime behavior as **[Verify]** until captured live.
