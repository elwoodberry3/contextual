# Data Schema

### Using JSON Schemas for Data Validation

JSON Schema is a powerful tool for data validation and description. It describes the structure and rules that a JSON data object must adhere to. Using JSON schemas in a microservices architecture helps in validating the data being exchanged between services.

Contextual also supports a small set of platform-specific schema extensions, such as `primaryKey`, `relations`, `secret`, `generate`, and UI-oriented `renderer` values. See [Contextual Schema Extensions](/documentation-and-resources/components-and-data/object-types/object-type-details/data-schema/contextual-schema-extensions.md).

#### Key Features of JSON Schema:

* **Type validation:** Ensures values in a data object are of expected types (e.g., strings, numbers, booleans).
* **Presence validation:** Checks for mandatory fields within a data object.
* **Format validation:** Validates formats of the data (e.g., date-time formats, email addresses).
* **Constraint validation:** Enforces restrictions like minimum/maximum values or string patterns.

{% code title="Example Data Schema" lineNumbers="true" %}

```json
{
  "type": "object",
  "properties": {
    "userId": {
      "type": "integer",
      "description": "The unique identifier for a user."
    },
    "email": {
      "type": "string",
      "format": "email",
      "description": "The user's email address."
    },
    "signupDate": {
      "type": "string",
      "format": "date-time",
      "description": "The date and time when the user registered."
    }
  },
  "required": ["userId", "email", "signupDate"]
}
```

{% endcode %}
