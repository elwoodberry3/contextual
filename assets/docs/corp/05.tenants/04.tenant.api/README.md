![Hero](../../../../imgs/pg-header.jpg)
# Tenant API

From the moment you create your Contextual Tenant, your Tenant API is available. As you create [Object Types](/documentation-and-resources/components-and-data/object-types.md) and define [Actions](/documentation-and-resources/components-and-data/object-types/object-type-details/actions.md) which can be executed for Records of an Object Type, the Tenant API is always kept up to date. It provides comprehensive permission management and access control, and detailed Swagger documentation. The Tenant API is one of several methods, as well as the most comprehensive and flexible, for exchanging information between your tenant and other systems.

## Your Tenant API Server Base URL

Your Tenant API Server URL will be in the format of `https://native-object.yourTenant.my.contextual.io/api/v1` - where "yourTenant" is replaced with the name of your tenant in your Tenant Workspace URL. You can also find this by clicking on **Tenant API** > **Documentation** in the main menu of the Tenant Workspace, and viewing the Base URL in the automatically-generated Swagger documentation.

## Object Type Endpoints

Every Object Type that you create in your Tenant will be added as a discrete endpoint to the Tenant API, and will be kept automatically up-to-date as you make any modifications to the Object Type. For instance, if you were to add a "customers" Object Type to your tenant, it would immediately become an endpoint in your Tenant API of `https://native-object.yourTenant.my.contextual.io/api/v1/customers`.

## Object Type Endpoint Methods and Required Scope

Each Object Type endpoint supports a variety of `GET`, `POST`, `PUT`, `PATCH`, and `DELETE` methods, and each method contains documentation of the purpose of the method, its required and optional Parameters, Response Codes and Descriptions, Example Schemas, and more. In order to use a particular method, the API client must have the required scope, which is managed by setting permissions available to Tenant [API Keys](/documentation-and-resources/tenants/what-is-the-tenant-api/api-keys.md).

## Audit Trail Endpoint Methods and Required Scope

The Audit Trail endpoint supports both `GET` and `POST` methods for the Audit Trail for an Object Type itself, as well as the Audit Trail for an instance of a given Object Type. Each method contains documentation of the purpose of the method, its required and optional Parameters, Response Codes and Descriptions, Example Schemas, and more. In order to use a particular method, the API client must have the required scope, which is managed by setting permissions available to Tenant [API Keys](/documentation-and-resources/tenants/what-is-the-tenant-api/api-keys.md).

## Notes

* **Security**: Handle your Client Secret with care. Consider a process to rotate it periodically to maintain security.
* **Permissions**: Review and adjust permissions regularly to ensure they align with your security policies and usage needs.

