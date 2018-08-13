import { ApiModelProperty } from '@nestjs/swagger';
import {
  AccessActorTypeEnum,
  AccessPermissionEnum,
  AccessResourceTypeEnum,
  AccessTypeEnum,
} from '../enums';

export class AclDto {
  @ApiModelProperty({
    description: 'Access permission. Possible values: ALLOW, DENY',
    enum: Object.values(AccessPermissionEnum),
    type: String,
  })
  readonly accessPermission: AccessPermissionEnum;

  @ApiModelProperty({
    type: String,
    enum: Object.values(AccessTypeEnum),
    description:
      'Access type. Possible values: ANY, READ, CREATE, UPDATE, DELETE, EXECUTE',
  })
  readonly accessType: AccessTypeEnum;

  @ApiModelProperty({
    description: 'Resource type. Possible values: MODEL, REST_RESOURCE',
    enum: Object.values(AccessResourceTypeEnum),
    type: String,
  })
  readonly resourceType: AccessResourceTypeEnum;

  @ApiModelProperty({
    description:
      'resource name. Examples: User, Product, /users, /products, /accounts/:id/members',
  })
  readonly resource: string;

  @ApiModelProperty({
    description: 'actor type. Possible values: ROLE',
    enum: Object.values(AccessActorTypeEnum),
    type: String,
  })
  readonly actorType: AccessActorTypeEnum;

  @ApiModelProperty({ description: 'actor id/name. For example, Role id' })
  readonly actor: string;
}
