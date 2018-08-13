import { ApiModelPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsMongoId, IsOptional, IsString } from 'class-validator';

import {
  AccessActorTypeEnum,
  AccessPermissionEnum,
  AccessResourceTypeEnum,
  AccessTypeEnum,
} from '../enums';

export class FindAclQueryDto {
  @ApiModelPropertyOptional({
    description: 'Access permission. Possible values: ALLOW, DENY',
    enum: Object.values(AccessPermissionEnum),
    type: String,
  })
  @IsOptional()
  @IsIn(Object.values(AccessPermissionEnum))
  readonly accessPermission?: AccessPermissionEnum;

  @ApiModelPropertyOptional({
    type: String,
    enum: Object.values(AccessTypeEnum),
    description:
      'Access type. Possible values: ANY, READ, CREATE, UPDATE, DELETE, EXECUTE',
  })
  @IsOptional()
  @IsIn(Object.values(AccessTypeEnum))
  readonly accessType?: AccessTypeEnum;

  @ApiModelPropertyOptional({
    description: 'Resource type. Possible values: MODEL, REST_RESOURCE',
    enum: Object.values(AccessResourceTypeEnum),
    type: String,
  })
  @IsOptional()
  @IsIn(Object.values(AccessResourceTypeEnum))
  readonly resourceType: AccessResourceTypeEnum;

  @ApiModelPropertyOptional({
    description:
      'resource name. Examples: User, Product, /users, /products, /accounts/:id/members',
  })
  @IsOptional()
  @IsString()
  readonly resource?: string;

  @ApiModelPropertyOptional({
    description: 'actor type. Possible values: ROLE',
    enum: Object.values(AccessActorTypeEnum),
    type: String,
  })
  @IsOptional()
  @IsIn(Object.values(AccessActorTypeEnum))
  readonly actorType?: AccessActorTypeEnum;

  @ApiModelPropertyOptional({
    description: 'actor id/name. For example, Role id',
  })
  @IsOptional()
  @IsMongoId()
  readonly actor?: string;
}
