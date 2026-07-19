/**
 * DropDocx Form Validation
 * Version: 2.0
 * Developer: Elwood Berry (elwood.berry@contextual.io)
 *
 * Outputs:
 *   1 — valid submission  → Build Record Body
 *   2 — invalid submission → LOG — Validation Failed (Warn) → 400 - Bad Request
 *
 * Design notes:
 *   - submitterName maxLength is DELIBERATELY not enforced here. The schema
 *     (maxLength: 100) is the enforcement layer under test for the Catch/500
 *     path (Lesson 2 pattern: function = client-error gate, schema = last
 *     line of defense). Enforce here too before production.
 *   - VERIFY-1 (file location after multipart POST) is unresolved. This
 *     function probes candidate paths and records which one matched in
 *     msg.validation.fileSource, so the first live POST resolves VERIFY-1
 *     via the existing log-taps. Candidates are Node-RED conventions,
 *     NOT confirmed Contextual behavior — prune once observed.
 */

// ─────────────────────────────────────────────────────────────
// 1. Form fields  (VERIFY-1: confirm msg.payload on live POST)
// ─────────────────────────────────────────────────────────────
const p = msg.payload || {};

const name  = (p.submitterName  || '').trim();
const email = (p.submitterEmail || '').trim();
const note  = (p.note           || '').trim();

// ─────────────────────────────────────────────────────────────
// 2. File discovery — probe candidates in priority order.
//    Each candidate is tagged so logs show where the file landed.
// ─────────────────────────────────────────────────────────────
const candidates = [
    // Inject fixtures: metadata stub travels with the JSON payload
    { source: 'payload.document (stub/fixture)', value: p.document },
    // CANDIDATE (inferred, Node-RED/multer convention): parsed upload array
    { source: 'req.files[0]',
      value: msg.req && Array.isArray(msg.req.files) ? msg.req.files[0] : undefined },
    // CANDIDATE (inferred): keyed by form field name "document"
    { source: 'req.files.document',
      value: msg.req && msg.req.files && !Array.isArray(msg.req.files)
             ? msg.req.files.document : undefined }
];

const hit  = candidates.find(c => c.value != null);
const file = hit ? hit.value : null;

// Normalize metadata defensively — property names vary by parser.
// NEVER copy buffer/binary content into these fields.
const fileMeta = file ? {
    filename: file.originalname || file.filename || file.name || '(unknown)',
    mimetype: file.mimetype     || file.type     || '(unknown)',
    size:     (typeof file.size === 'number') ? file.size : null,
    source:   hit.source
} : null;

// ─────────────────────────────────────────────────────────────
// 3. File policy (applied only when metadata is present —
//    unknown shapes fail open here, schema/upload fail closed)
// ─────────────────────────────────────────────────────────────
const ALLOWED_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

// ─────────────────────────────────────────────────────────────
// 4. Validation
// ─────────────────────────────────────────────────────────────
const errors = [];

if (!name)  errors.push('submitterName is required');
if (!email) errors.push('submitterEmail is required');
else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('submitterEmail is invalid');
if (!note)  errors.push('note is required');

if (!file) {
    errors.push('document file is required');
} else {
    if (fileMeta.mimetype !== '(unknown)' && !ALLOWED_TYPES.includes(fileMeta.mimetype)) {
        errors.push('unsupported file type: ' + fileMeta.mimetype);
    }
    if (fileMeta.size !== null && fileMeta.size > MAX_BYTES) {
        errors.push('file exceeds 10MB limit');
    }
}

// ─────────────────────────────────────────────────────────────
// 5. Route
// ─────────────────────────────────────────────────────────────
if (errors.length) {
    msg.validation = {
        valid: false,
        errors: errors,
        fileSource: fileMeta ? fileMeta.source : 'none'
    };
    msg.payload = { success: false, message: errors.join('; ') }; // 400 JSON body
    return [null, msg];                                            // → output 2
}

msg.validation = {
    valid: true,
    fileSource: fileMeta.source   // ← resolves VERIFY-1 in the logs
};
msg.input = {
    form: { submitterName: name, submitterEmail: email, note: note },
    file: {
        meta: fileMeta,   // safe to log
        ref:  file        // raw file object for Upload Attachments (VERIFY-2)
                          // — NEVER point a log-tap at msg.input.file.ref
    }
};
return [msg, null];                                                // → output 1