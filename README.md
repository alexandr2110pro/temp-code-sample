An Access Control module.
-------------------------

:warning: Doesn't contain other modules that are required for it to work. :warning:

---

The access control system.
Allows to control the access in a flexible way
using Access Control Lists (ACLs).

ACLs are persisted in the DB. In this implementation - in the MongoDB.
But it is planned to migrate to Redis or something else for the better performance.

Decouples the access control from the code implementation.
Doesn't require configuration/decorators/whatever in the client code.
Just import the module, use the Guard and create ACLs.


