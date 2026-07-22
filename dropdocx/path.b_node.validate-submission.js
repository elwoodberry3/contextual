/**
 * DropDocx Form Validation
 * Version: 2.1
 * Developer: Elwood Berry (elwood.berry@contextual.io)
 *
 * Outputs:
 *   1 — valid submission  → Build Record Body
 *   2 — invalid submission → LOG — Validation Failed (Warn) → 400 - Bad Request
 *
 * Design notes:
 *   - submitterName maxLength is DELIBERATELY not enforced here. The schema
 *     (maxLength: 100) is the enforcement layer under test for the Catch/500
 *     path (function = client-error gate, schema = last line of defense).
 *     Enforce here too before production.
 *   - VERIFY-1 RESOLVED (session kdgCfSMLKYzribPKgUSpd1, 2026-07-20):
 *     form fields → msg.req.body (mirrored to msg.payload),
 *     file → msg.req.files[0] (array; fieldname "document").
 *     Probe pruned to: fixture stub, then observed live path.
 */

// ── 1. Form fields (observed: msg.payload mirrors msg.req.body) ──
const p = msg.payload || {};

const name = (p.submitterName || '').trim();
const email = (p.submitterEmail || '').trim();
const note = (p.note || '').trim();

// ── 2. File location — fixture stub first, then observed live path ──
const isFixture = !!p.document;
const file = p.document
    || (msg.req && Array.isArray(msg.req.files) ? msg.req.files[0] : null);

const fileMeta = file ? {
    filename: file.originalname || file.filename || '(unknown)',
    mimetype: file.mimetype || '(unknown)',
    size: (typeof file.size === 'number') ? file.size : null,
    source: isFixture ? 'payload.document (fixture)' : 'req.files[0] (live)'
} : null;

// ── 3. File policy ──
const ALLOWED_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

// ── 4. Validation ──
const errors = [];

if (!name) errors.push('submitterName is required');
if (!email) errors.push('submitterEmail is required');
else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('submitterEmail is invalid');
if (!note) errors.push('note is required');

if (!file) {
    errors.push('document file is required');
} else {
    // Live path always carries mimetype (observed); '(unknown)' can only
    // occur on fixture stubs, which fail open here by design.
    if (fileMeta.mimetype !== '(unknown)' && !ALLOWED_TYPES.includes(fileMeta.mimetype)) {
        errors.push('unsupported file type: ' + fileMeta.mimetype);
    }
    if (fileMeta.size !== null && fileMeta.size > MAX_BYTES) {
        errors.push('file exceeds 10MB limit');
    }
}

// ── 5. Route ──
if (errors.length) {
    msg.validation = { valid: false, errors, fileSource: fileMeta ? fileMeta.source : 'none' };
    msg.logline = {                       // ← point LOG — Validation Failed at msg.logline ONLY
        stage: 'validation-failed',
        errors,
        filename: fileMeta ? fileMeta.filename : null,
        fileSource: fileMeta ? fileMeta.source : 'none'
    };
    msg.payload = { success: false, message: errors.join('; ') };
    return [null, msg];
}

msg.validation = { valid: true, fileSource: fileMeta.source };
msg.input = {
    form: { submitterName: name, submitterEmail: email, note: note },
    file: {
        meta: fileMeta,   // safe to log
        ref: file        // consumed by Upload Attachments (VERIFY-2 closed by live run)
        // — NEVER point a log-tap at msg.input.file.ref
    }
};
return [msg, null];