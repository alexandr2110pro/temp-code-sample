import { Schema } from 'mongoose';
import { createSchema } from '../../mongoose-utils';

export const AclSchema: Schema = createSchema({
  accessPermission: String,
  accessType: String,
  resourceType: String,
  resource: String,
  actorType: String,
  actor: String,
});
