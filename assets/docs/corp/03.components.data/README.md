![Hero](../../../imgs/pg-header.jpg)  
# Object Types

### Introduction

Managing and validating data effectively, and having it immediately available throughout your Contextual solution, is crucial for seamless and performant inter-service communication and data consistency. Contextual's Object Types let you define structured data formats that are automatically validated and processed consistently across every component and interface within your Contextual solution. This article explains the concept of Object Types, the use of JSON schemas for validation, and their role in standardizing the storage, display, and exchange of data in your Contextual solution and enterprise processes.

### What are Object Types?

<mark style="background-color:green;">Object Types are structured data definitions that describe the format, types of data, and validation rules for</mark> [<mark style="background-color:green;">**Records**</mark>](/documentation-and-resources/components-and-data/object-types/data-in-contextual.md) <mark style="background-color:green;">of that Object Type within your Contextual solution. Object Types ensure that data is sent and received in a consistent format, and provide you with a turnkey</mark> [<mark style="background-color:green;">**Tenant API**</mark>](https://github.com/ContextualIO/docs/blob/main/components-and-data/object-types/broken-reference/README.md)<mark style="background-color:green;">, full permission controls, audit trail, version control, triggers, actions and more for your data.</mark>

Object Types in Contextual include:

* [**Definition**](/documentation-and-resources/components-and-data/object-types/object-type-details/definition.md)**:** Id, Display Name, Description, and Category
* [**Data Schema**](/documentation-and-resources/components-and-data/object-types/object-type-details/data-schema.md)**:** a JSON schema that describes the format and primaryKey (permanent) of Records created for the Object Type - importantly, schemas don't need to include properties like createdAt or updatedAt timestamps which are automatically added to Records as [Metadata](/documentation-and-resources/components-and-data/object-types/object-type-details/data-schema/automatic-metadata.md)
* [**UI Schema**](/documentation-and-resources/components-and-data/object-types/object-type-details/ui-schemas.md): a collection of JSON schemas that describe the UI for the Object Type within the Contextual Workspace UI
* [**Optional Features**](/documentation-and-resources/components-and-data/object-types/object-type-details/features.md)**:** manage Audit Trail and Record Versioning, on supported subscription plans
* [**Triggers**](/documentation-and-resources/components-and-data/object-types/object-type-details/triggers.md)**:** send Records to [Agents](/documentation-and-resources/components-and-data/agents.md) (and their [Flows](/documentation-and-resources/components-and-data/flows.md)) automatically Post-Insert, Post-Update, and Post-Delete for processing
* [**Actions**](/documentation-and-resources/components-and-data/object-types/object-type-details/actions.md)**:** send Records to [Agents](/documentation-and-resources/components-and-data/agents.md) (and their [Flows](/documentation-and-resources/components-and-data/flows.md)) manually in the Contextual Workspace UI, or by executing the Action on a Record using the [Tenant API](https://github.com/ContextualIO/docs/blob/main/components/object-types/broken-reference/README.md)
* [**Versions**](/documentation-and-resources/components-and-data/object-types/object-type-details/versions.md)**:** as changes are made to the Object Type, a version history is kept - keep track of changes and restore previous versions if needed
* [**Templates**](/documentation-and-resources/components-and-data/object-types/object-type-details/templates.md)**:** define multiple templates with suggested or pre-filled values for Record properties, to aid in rapid and well-informed data entry within the Contextual Workspace UI
* [**Records**](/documentation-and-resources/components-and-data/object-types/object-type-details/records.md)**:** one record, or a million - limited only by your Contextual subscription plan

Get started by [Creating an Object Type](/documentation-and-resources/components-and-data/object-types/creating-an-object-type.md).

### Benefits of Object Types in Contextual

* **Consistency and Predictability:** Ensures all parts of your Contextual solution and integrations with other systems adhere to a defined data structure, in programmatic and user-facing interfaces.
* **Validation:** Automatic validation of [incoming data](/documentation-and-resources/patterns/solution-architecture/event-i-o.md) to prevent erroneous or malicious data from affecting the system.
* **Interoperability:** Enables different services to work together seamlessly, understanding the data exchanged without ambiguity using an instant and always up-to-date [Tenant API](https://github.com/ContextualIO/docs/blob/main/components-and-data/object-types/broken-reference/README.md)
* **Documentation:** Acts as a self-documenting mechanism for the data in your solution, improving understandability and maintainability.
* **Performance:** Internal storage using Contextual Object Types ensures enhanced data security and control, superior performance with low latency operations, and seamless integration.

### Conclusion

Contextual Object Types defined with JSON schemas offer a robust method for ensuring data integrity, validation, and consistent data presentation - paired with highly performant, scalable Record storage whether you're storing 1 record or 1 million. They are instrumental in building scalable, reliable, and maintainable solutions by providing clear specifications for data exchange and validation rules. Utilizing Object Types effectively can lead to improved data quality, better interoperability, and a more cohesive developer and user experience across different interfaces.
