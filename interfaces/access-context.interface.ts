import { AccessActorTypeEnum } from '../enums';

export interface AccessContext {
  readonly userId: string;
  readonly accountId: string;
  readonly actor: string;
  readonly actorType: AccessActorTypeEnum;
}
