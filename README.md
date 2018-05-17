# About this repository
This is a hobby project aimed at adding a security layer on top of Elasticsearch REST API (assuming that X-Pack is not used). It targets a case when a single Elasticsearch cluster is used by multiple tenants, and each tenant wants to be able to control their portion of data in the cluster using the full power of Elasticsearch API. It is designed to work as a middleware between the client and Elasticsearch:

```
Tenant -> nginx (optional) -> This Application -> Elasticsearch API
```

Responsibility of this application is to authenticate the user (using HTTP basic auth; more sophisticated scenario should be handled by the upper layer), and athorize his action based on the request signature.

Request signatures are determined by comparing the request (mainly, method + path) with the official Elascitsearch REST API specs published on their GitHub: https://github.com/elastic/elasticsearch/tree/master/rest-api-spec/src/main/resources/rest-api-spec/api

It is possible to configure a namespace for each user (e.g. user "foo" can read/write to indices prefixed "foo_", but can not access indices prefixed with "bar_") and whitelist/blacklist specific API endpoints (for example, restrict reindex, forcemerge, etc.).

The application is designed to properly parse _bulk requests (it will look into the payload and authorize index for each document), and also handle "glob" patterns for multi-index operations.

**The application is in a very early stage of development!**