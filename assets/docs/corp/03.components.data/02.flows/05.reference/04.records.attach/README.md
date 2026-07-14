# Records & Attachments

These nodes let you interact with Object Type records and their file attachments from within your flows. Use them to create, read, update, delete, and search records, trigger configured Actions, and manage files stored against individual records using Record Level Attachments.

In the Flow Editor, these nodes are available in the left palette under the **Records** section.

### Records

* [Search Object](/documentation-and-resources/components-and-data/flows/node-reference/object/search-object-type.md) — query records of an Object Type using filters, search statements, and sort order, with pagination
* [Get Object](/documentation-and-resources/components-and-data/flows/node-reference/object/get-object.md) — retrieve a single record by its ID
* [Create Object](/documentation-and-resources/components-and-data/flows/node-reference/object/create-object.md) — create a new record
* [Patch Object](/documentation-and-resources/components-and-data/flows/node-reference/object/patch-object.md) — partially update a record, modifying only the fields you specify
* [Put Object](/documentation-and-resources/components-and-data/flows/node-reference/object/put-object.md) — replace a record in full
* [Delete Object](/documentation-and-resources/components-and-data/flows/node-reference/object/delete-object.md) — delete a record by its ID
* [Run Action](/documentation-and-resources/components-and-data/flows/node-reference/object/run-action.md) — execute a configured Action on a record

### Attachments

Attachment nodes operate on files associated with individual records. They require Record Level Attachments to be available for the Object Type specified.

* [Upload Attachment](/documentation-and-resources/components-and-data/flows/node-reference/object/upload-attachment.md) — attach one or more files to a record, accepting browser uploads, email payloads, or binary buffers
* [Search Attachments](/documentation-and-resources/components-and-data/flows/node-reference/object/search-attachments.md) — list and filter attachments by size, content type, upload date, and optionally by record
* [Read Attachment](/documentation-and-resources/components-and-data/flows/node-reference/object/read-attachment.md) — retrieve the content of an attachment by ID as a stream, buffer, arraybuffer, or string
* [Delete Attachment](/documentation-and-resources/components-and-data/flows/node-reference/object/delete-attachment.md) — remove an attachment from a record by ID

#### Record Versioning Compatibility

If Record Versioning is enabled on an Object Type, attachments are fully version-controlled alongside the record's data:

* **Attachment changes create new record versions.** Uploading or deleting an attachment on a record produces a new version of that record, just as editing a data field would.
* **Rolling back a record restores its attachments.** When you roll back a record to an earlier version, the set of attachments associated with that version is restored as well. For example, if version 3 of a record has `fileA.pdf` attached and version 4 has it deleted, rolling back to version 3 (which creates a new version 5 matching version 3) will restore `fileA.pdf`.

#### Viewing Attachments in the Tenant Dashboard

An **Attachments** panel appears on each record's detail view in the tenant dashboard. From here you can see all files attached to a record, preview or download individual files, and remove attachments manually.
