import { Connection, Model } from 'mongoose';
import { ModelProviderDefinition } from '../../database';
import { AclBindings } from '../bindings';
import { Acl } from '../interfaces';
import { AclSchema } from '../schemas';

export const aclModelProvider: ModelProviderDefinition<Acl> = {
  inject: [],
  provide: AclBindings.MODEL,
  useFactory: (c: Connection): Model<Acl> =>
    c.model(AclBindings.MODEL_NAME, AclSchema),
};
