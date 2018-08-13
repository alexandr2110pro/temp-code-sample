import { AccessResourceTypeEnum } from '../enums';

export interface AccessResource {
  readonly resourceType: AccessResourceTypeEnum;
  readonly resource: string;
}
