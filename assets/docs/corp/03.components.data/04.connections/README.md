![Hero](../../../../imgs/pg-header.jpg)
# Types of Connections

The following connection types are supported:

## Basic

The "Basic" type supports HTTP Basic Authentication which requires that a username and password are send in the http authentication header.

## Bearer

The "Bearer" type support HTTP Bearer Authentication which requires that a bearer token be provide in the HTTP authentication header.

## Client Grant

The "Client Grant" type is used for OAUTH2 client grant authentication in which a Client Id and Client Secret are exchanged for an authentication token. The authentication token is then used as a Bearer token. Tokens can have varying expiration times however (sometimes as short an an hour) and must be renewed periodically using the Client Id and Secret.

## Kafka

The "Kafka" type is used specifically for a connection to an Apache Kafka message broker and as such requires specific information about the broker.

## Password Grant

The "Password Grant" type is used for an OAUTH2 Password Grant which makes use of a "Resource Owner's" username and password credentiasl.

## Public

The "Public" type means that the third-party API does not require any authentication and is open to the public.

## AI Connections

AI Connections (AI Provider Connections) are Connections configured specifically for AI providers used by Contextual’s AI Gateway. They are referenced by [AI Routes](/documentation-and-resources/components-and-data/ai-routes.md) and used by nodes like [AI Generate](/documentation-and-resources/components-and-data/flows/node-reference/ai-gateway/ai-generate.md). Under the hood, they populate the appropriate Connection type and fields for the selected provider.

## Pulsar

Similar to the "Kafka" type, the "Pulsar" type is used specification for a connection to an Apahe Pulsar message broker and as such requires application-specific information be provided about the broker.

Each of these connection types are described in detail on the following pages.
