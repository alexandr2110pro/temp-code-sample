import { ApiModelProperty } from '@nestjs/swagger';
import { IsIn, IsMongoId, IsString } from 'class-validator';
import {
  AccessActorTypeEnum,
  AccessPermissionEnum,
  AccessResourceTypeEnum,
  AccessTypeEnum,
} from '../enums';

export class UpdateAclDto {
  @ApiModelProperty({
    description: 'Access permission. Possible values: ALLOW, DENY',
    enum: Object.values(AccessPermissionEnum),
    type: String,
  })
  @IsIn(Object.values(AccessPermissionEnum))
  readonly accessPermission: AccessPermissionEnum;

  @ApiModelProperty({
    type: String,
    enum: Object.values(AccessTypeEnum),
    description:
      'Access type. Possible values: ANY, READ, CREATE, UPDATE, DELETE, EXECUTE',
  })
  @IsIn(Object.values(AccessTypeEnum))
  readonly accessType: AccessTypeEnum;

  @ApiModelProperty({
    description: 'Resource type. Possible values: MODEL, REST_RESOURCE',
    enum: Object.values(AccessResourceTypeEnum),
    type: String,
  })
  @IsIn(Object.values(AccessResourceTypeEnum))
  readonly resourceType: AccessResourceTypeEnum;

  @ApiModelProperty({
    description:
      'resource name. Examples: User, Product, /users, /products, /accounts/:id/members',
  })
  @IsString()
  readonly resource: string;

  @ApiModelProperty({
    description: 'actor type. Possible values: ROLE',
    enum: Object.values(AccessActorTypeEnum),
    type: String,
  })
  @IsIn(Object.values(AccessActorTypeEnum))
  readonly actorType: AccessActorTypeEnum;

  @ApiModelProperty({
    description: 'actor id/name. For example, Role id',
  })
  @IsMongoId()
  readonly actor: string;
}
