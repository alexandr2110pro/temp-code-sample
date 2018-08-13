import { Document } from 'mongoose';

import { Role } from '../../roles';

import {
  AccessActorTypeEnum,
  AccessPermissionEnum,
  AccessResourceTypeEnum,
  AccessTypeEnum,
} from '../enums';

/**
 * Defines the rule that controls the access
 * to protected the `AccessResource` for an `AccessActor`
 *
 * ```typescript
 * // this will
 * // DENY UPDATE actions
 * // on the REST_RESOURCE "'/cash-registers/:id"
 * // for the ROLE with the _id equals to 'role_id'
 * const aclEntityObject: Acl = {
 *   accessPermission: AccessPermissionEnum.DENY,
 *   accessType: AccessTypeEnum.UPDATE,
 *   resourceType: AccessResourceTypeEnum.REST_RESOURCE,
 *   resource: '/cash-registers/:id',
 *   actorType: AccessActorTypeEnum.ROLE,
 *   accessActor: 'role_id',
 * };
 *
 * // this will
 * // DENY UPDATE actions
 * // on the MODEL "Account"
 * // for the ROLE with the _id equals to 'role_id'
 * const aclEntityObject: Acl = {
 *   accessPermission: AccessPermissionEnum.DENY,
 *   accessType: AccessTypeEnum.UPDATE,
 *   resourceType: AccessResourceTypeEnum.MODEL,
 *   resource: 'Account',
 *   actorType: AccessActorTypeEnum.ROLE,
 *   accessActor: 'role_id',
 * };
 * ```
 */
export interface Acl extends Document {
  readonly accessPermission: AccessPermissionEnum | string;
  readonly accessType: AccessTypeEnum | string;
  readonly resourceType: AccessResourceTypeEnum | string;
  readonly actorType: AccessActorTypeEnum | string;
  readonly resource: string;
  actor: Role | string;
}
