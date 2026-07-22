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

The architecture is intentionally **acyclic**: record *insert* fires enrichment; record *update* fires the auditor; the auditor writes only to trigger-less state. This topology — not conditional logic — is the loop-prevention argument.

**Current state (2026-07-21):** The intake leg and the AI enrichment leg are **built, deployed, and verified end-to-end in the live tenant.** A submitted record now flows: HTTP intake → record + attachment → insert trigger → Event Flow → Claude via AI Route → validated JSON → Patch write-back → `AI_PROCESSED`. The change-auditor leg (update trigger + second Event Flow) remains to be built.

### Use Case

An external submitter provides their name, email, a free-text note, and a supporting document. DropDocx:

1. Receives the multipart submission over HTTP and validates required fields. **[Observed]**
2. Creates an `Intake Request` record at status `RECEIVED`. **[Observed]**
3. Stores the uploaded file as a **record-level attachment** on that record. **[Observed]**
4. Returns the new record ID to the caller; invalid input returns a controlled `400`. **[Observed]**
5. Asynchronously enriches the record with an AI-generated summary, category, and confidence, transitioning it to `AI_PROCESSED` (or `AI_FAILED`). **[Observed]**
6. Audits the enrichment transition by comparing old-versus-new record state. **[Proposed]**

---

## Components

### Object Types

#### Intake Request

**[Observed]** The single Object Type backing the system. Version 6. It deliberately separates submitter-provided fields from system- and AI-generated fields.

| Field | Type | Source | Notes |
|---|---|---|---|
| `id` | string (uuid v4) | System-generated | Primary key |
| `createdAt` | string (date-time) | System-generated | Record creation timestamp |
| `submitterName` | string (1–100) | Submitter | Required |
| `submitterEmail` | string (email) | Submitter | Required |
| `note` | string (min 1) | Submitter | Required |
| `status` | enum | System | `RECEIVED` / `AI_PROCESSED` / `AI_FAILED` — required |
| `aiSummary` | string | AI (write-back) | **[Observed]** populated live |
| `aiCategory` | string | AI (write-back) | **[Observed]** populated live |
| `aiConfidence` | number (0–1) | AI (write-back) | **[Observed]** populated live |
| `aiProcessedAt` | string | AI (write-back) | **[Observed]** populated live |

`additionalProperties: false` and `primaryKey: id`. Required set: `submitterName`, `submitterEmail`, `note`, `status`.

**Record-level attachments are confirmed enabled and working.** **[Observed]** Attachment metadata appears on the record at `_metaData.attachments`:

```json
"attachments": { "count": 1, "ids": ["oMA1B5qxJW8MUeAPitgHZV"], "size": 171063 }
```

The attachment object itself carries a `ref` binding it to the record:

```json
"_metaData": { "ref": { "namespace": "native-object",
                        "typeId": "intake-request",
                        "instanceId": "<record uuid>" } }
```

Storage path pattern: `native-object/intake-request/{instanceId}/{attachmentId}`. This is a genuine record-level attachment — not a filename, URL, or base64 field.

Design decisions worth defending on camera:
- **Status lifecycle is minimal and demonstrable.** Only states the implementation can reliably set.
- **AI fields are namespaced (`ai*`)** to make the enrichment write-back visually obvious in old-versus-new audit logs.
- **Schema was drafted with SolutionAI Data Model, then verified manually against the JSON** — "vibe-code the draft, craft the final."
- **AI output is model-generated and non-deterministic.** Identical notes have produced `aiCategory: "test"` and `"test submission"` across runs. The design persists `aiConfidence` and validates output *shape*, not content.

---

### Flows

#### HTTP Intake — `dropdocx-http-intake`

**[Observed]** Receives DropDocx submissions as multipart form data, validates, creates the record, attaches the file, and responds. Flow version 67+.

**Path A — `GET /form`** *(confirmed configured)*
`HTTP In (/form)` → `Log` → `Template` → `HTTP Response (200)`.
Serves static form HTML. The HTML contract is non-negotiable: `method="POST" action="/submit"`, `enctype="multipart/form-data"`, field names `submitterName`, `submitterEmail`, `note`, and a file input named `document`.

**Path B — `POST /submit`** *(confirmed working end-to-end)*
`HTTP In (/submit, POST)` → `Log (info)` → `Function: Validate Submission` → `Change: Build Record Body` → `Create Intake Request` → `Upload Attachment` → `Change: Build Response` → `Log (info)` → `HTTP Response`.

**RESOLVED — multipart message shape** **[Observed]**
The uploaded file lands at **`msg.req.files`** as an **array** (multer-style), *not* a keyed object:

```javascript
msg.req.files[0] = {
  fieldname: "document", originalname: "hvac-fault-report.pdf",
  encoding: "7bit", mimetype: "application/pdf",
  buffer: Buffer(171063), size: 171063
}
```

Correct retrieval matches on fieldname rather than index — robust to field reordering:
```javascript
const file = (msg.req.files || []).find(f => f.fieldname === 'document');
```

Form text fields land at **both** `msg.payload` and `msg.req.body` as `{submitterName, submitterEmail, note}`. `msg.payload` is the canonical read.

**Create Object node** **[Observed]** — `Type Id: Intake Request`, `Input: msg.payload`, `Output: msg.payload`. Note the Help panel's **reserved `msg` keys** (`typeId`, `typeIdType`, `property`, `propertyType`, `outputProperty`, `responseProperty`): if present as top-level `msg` properties they override node config. DropDocx's message convention (`msg.input`, `msg.record`, `msg.ai`) deliberately avoids all of them.

**Path C — error handling**
`Catch` → `Log (error)` → `HTTP Response (500)`, plus the controlled `400` branch fed by the validation node's second output.

Observed logging on this flow — scalar-only, no binary:
```json
{"stage":"submission-received","submitter":"…","noteLength":80,
 "filename":"hvac-fault-report.pdf","mimetype":"application/pdf","size":171063}
{"success":true,"recordId":"…","attachmentId":"…"}
```
All lines share a platform `correlationId`, giving true request-scoped tracing.

#### DropDocx AI Enrichment — `dropdocx-ai-enrichment`

**[Observed — working end-to-end]** Event Flow bound to `dropdocx-ai-enrichment-agent`, subscribed to the `Intake Request` insert trigger topic.