![Hero](../../../../imgs/pg-header.jpg)
# Connections

Connections are Contextual's way of making integration with third-party APIs and services much easier than they otherwise would be. When making API calls from a Flow, Connections provide a number of important capabilities:

* Connections insulate the developer from needing to provide the URL of the external service.
* They also encapsulate the authentication strategy for the particular service (e.g. Basic Auth, OAUTH2 Client Grant, etc) and ensure that the developer doesn't have to be aware of things like token exchanges/renewals.
* They store any secrets associated with the connection in an encrypted key vault, ensuring that such secrets, bearer tokens, or passwords are not accessible to anyone other than administrators with access to the connections.

These features ensure that flow developers have full access to third-party APIs but no access or responsibility to the API configurations and credentials.
