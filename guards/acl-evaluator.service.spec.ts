import {
  AccessActorTypeEnum,
  AccessPermissionEnum,
  AccessResourceTypeEnum,
  AccessTypeEnum,
} from '../enums';
import { AclEvaluatorService } from './acl-evaluator.service';

describe('AclEvaluatorService', () => {
  let aclEvaluatorService: AclEvaluatorService;

  beforeEach(() => {
    aclEvaluatorService = new AclEvaluatorService();
  });

  describe('.evaluate()', () => {
    const ALCs: any[] = [
      {
        accessPermission: 'DENY',
        accessType: 'ANY',
        resourceType: 'REST_RESOURCE',
        resource: '/test/*/segment/**',
        actorType: 'ROLE',
        actor: 'role',
      },
      {
        accessPermission: 'DENY',
        accessType: 'ANY',
        resourceType: 'REST_RESOURCE',
        resource: '/test/*/**',
        actorType: 'ROLE',
        actor: 'role',
      },
      {
        accessPermission: 'DENY',
        accessType: 'ANY',
        resourceType: 'REST_RESOURCE',
        resource: '/test/*/sub/**',
        actorType: 'ROLE',
        actor: 'role',
      },
      {
        accessPermission: 'ALLOW',
        accessType: 'CREATE',
        resourceType: 'REST_RESOURCE',
        resource: '/test/*/sub/**',
        actorType: 'ROLE',
        actor: 'role',
      },
      {
        accessPermission: 'DENY',
        accessType: 'ANY',
        resourceType: 'REST_RESOURCE',
        resource: '/test/**',
        actorType: 'ROLE',
        actor: 'role',
      },
    ];

    it('should calculate the best matching permission', () => {
      expect(
        aclEvaluatorService.evaluate(
          ALCs,
          AccessTypeEnum.CREATE,
          {
            resource: '/test/some_id/sub/member',
            resourceType: AccessResourceTypeEnum.REST_RESOURCE,
          },
          {
            actor: 'role',
            actorType: AccessActorTypeEnum.ROLE,
            accountId: '123',
            userId: '123',
          }
        )
      ).toEqual(AccessPermissionEnum.ALLOW);

      expect(
        aclEvaluatorService.evaluate(
          ALCs,
          AccessTypeEnum.READ,
          {
            resource: '/test/some_id/sub/member',
            resourceType: AccessResourceTypeEnum.REST_RESOURCE,
          },
          {
            actor: 'role',
            actorType: AccessActorTypeEnum.ROLE,
            accountId: '123',
            userId: '123',
          }
        )
      ).toEqual(AccessPermissionEnum.DENY);
    });
  });
});
