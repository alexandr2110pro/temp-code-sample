import { Prefixer } from '../../prefixer';

const prefixer = new Prefixer(['Acl']);

export namespace AclBindings {
  export const MODEL = prefixer.prefixString('ACL_MODEL');
  export const MODEL_NAME = 'Acl';
}
