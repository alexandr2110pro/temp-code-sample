import { HttpStatus } from '@nestjs/common';
import {
  createRandomId,
  E2ETestingContainer,
  E2ETestingModulesFactory,
  JEST_E2E_TIMEOUT,
} from '../../testing';

import { AclModule } from '../acl.module';
import { CreateAclDto } from '../dto';
import {
  AccessActorTypeEnum,
  AccessPermissionEnum,
  AccessResourceTypeEnum,
  AccessTypeEnum,
} from '../enums';

jest.setTimeout(JEST_E2E_TIMEOUT);

describe('ACL Validation', () => {
  let e2eTestingContainer: E2ETestingContainer;

  beforeAll(async () => {
    e2eTestingContainer = E2ETestingModulesFactory.createModule({
      imports: [AclModule],
    });

    await e2eTestingContainer.compile();
    await e2eTestingContainer.start();
  });

  afterAll(async (done: jest.DoneCallback) => {
    await e2eTestingContainer.teardown();
    done();
  });

  describe('API', () => {
    describe('POST /acls', () => {
      it('should not create an acl instance if actor is not mongoose object id', () => {
        const createAclDto: CreateAclDto = {
          accessPermission: AccessPermissionEnum.ALLOW,
          accessType: AccessTypeEnum.CREATE,
          resourceType: AccessResourceTypeEnum.REST_RESOURCE,
          resource: '/test-resource',
          actorType: AccessActorTypeEnum.ROLE,
          actor: createRandomId(),
        };
        return e2eTestingContainer
          .request()
          .post('/acls')
          .send({ ...createAclDto, actor: 1234 })
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('should not create an acl instance if resource is not string value', () => {
        const createAclDto: CreateAclDto = {
          accessPermission: AccessPermissionEnum.ALLOW,
          accessType: AccessTypeEnum.CREATE,
          resourceType: AccessResourceTypeEnum.REST_RESOURCE,
          resource: '/test-resource',
          actorType: AccessActorTypeEnum.ROLE,
          actor: createRandomId(),
        };
        return e2eTestingContainer
          .request()
          .post('/acls')
          .send({ ...createAclDto, resource: 1234 })
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('should not create an acl instance if accessPermission is not from allowed values', () => {
        return e2eTestingContainer
          .request()
          .post('/acls')
          .send({
            accessPermission: 'String',
            accessType: AccessTypeEnum.CREATE,
            resourceType: AccessResourceTypeEnum.REST_RESOURCE,
            resource: '/test-resource',
            actorType: AccessActorTypeEnum.ROLE,
            actor: createRandomId(),
          })
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('should not create an acl instance if accessType is not from allowed values', () => {
        return e2eTestingContainer
          .request()
          .post('/acls')
          .send({
            accessPermission: AccessPermissionEnum.ALLOW,
            accessType: 'String',
            resourceType: AccessResourceTypeEnum.REST_RESOURCE,
            resource: '/test-resource',
            actorType: AccessActorTypeEnum.ROLE,
            actor: createRandomId(),
          })
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('should not create an acl instance if resourceType is not from allowed values', () => {
        return e2eTestingContainer
          .request()
          .post('/acls')
          .send({
            accessPermission: AccessPermissionEnum.ALLOW,
            accessType: AccessTypeEnum.CREATE,
            resourceType: 'String',
            resource: '/test-resource',
            actorType: AccessActorTypeEnum.ROLE,
            actor: createRandomId(),
          })
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('should not create an acl instance if resourceType is not from allowed values', () => {
        return e2eTestingContainer
          .request()
          .post('/acls')
          .send({
            accessPermission: AccessPermissionEnum.ALLOW,
            accessType: AccessTypeEnum.CREATE,
            resourceType: AccessResourceTypeEnum.REST_RESOURCE,
            resource: '/test-resource',
            actorType: 'String',
            actor: createRandomId(),
          })
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('should not create an acl instance if all required keys are not defined', () => {
        return e2eTestingContainer
          .request()
          .post('/acls')
          .send({
            resource: '/test-resource',
            actorType: AccessActorTypeEnum.ROLE,
          })
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('should not create an acl instance if body is empty', () => {
        return e2eTestingContainer
          .request()
          .post('/acls')
          .send({})
          .expect(HttpStatus.BAD_REQUEST);
      });
    });
  });

  describe('GET /acls', () => {
    it('should not get acls if actor is not mongoose object id', () => {
      return e2eTestingContainer
        .request()
        .get('/acls?actor=1234')
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('PUT /acls/:id', () => {
    it('should not update acl if id is invalid', () => {
      return e2eTestingContainer
        .request()
        .put('/acls/invalid1234')
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should not update acl if body is empty', () => {
      return e2eTestingContainer
        .request()
        .put(`/acls/${createRandomId()}`)
        .send({})
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should not update acl if actor is not mongoose object id', () => {
      return e2eTestingContainer
        .request()
        .put(`/acls/${createRandomId()}`)
        .send({
          accessPermission: AccessPermissionEnum.ALLOW,
          accessType: AccessTypeEnum.CREATE,
          resourceType: AccessResourceTypeEnum.REST_RESOURCE,
          resource: '/test-resource',
          actorType: AccessActorTypeEnum.ROLE,
          actor: 12345,
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should not update acl if accessPermission is not from allowed values', () => {
      return e2eTestingContainer
        .request()
        .put(`/acls/${createRandomId()}`)
        .send({
          accessPermission: 'string',
          accessType: AccessTypeEnum.CREATE,
          resourceType: AccessResourceTypeEnum.REST_RESOURCE,
          resource: '/test-resource',
          actorType: AccessActorTypeEnum.ROLE,
          actor: createRandomId(),
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should not update acl if accessType is not from allowed values', () => {
      return e2eTestingContainer
        .request()
        .put(`/acls/${createRandomId()}`)
        .send({
          accessPermission: AccessPermissionEnum.ALLOW,
          accessType: 'string',
          resourceType: AccessResourceTypeEnum.REST_RESOURCE,
          resource: '/test-resource',
          actorType: AccessActorTypeEnum.ROLE,
          actor: createRandomId(),
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should not update acl if resourceType is not from allowed values', () => {
      return e2eTestingContainer
        .request()
        .put(`/acls/${createRandomId()}`)
        .send({
          accessPermission: AccessPermissionEnum.ALLOW,
          accessType: AccessTypeEnum.CREATE,
          resourceType: 'string',
          resource: '/test-resource',
          actorType: AccessActorTypeEnum.ROLE,
          actor: createRandomId(),
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should not update acl if resource is not string value', () => {
      return e2eTestingContainer
        .request()
        .put(`/acls/${createRandomId()}`)
        .send({
          accessPermission: AccessPermissionEnum.ALLOW,
          accessType: AccessTypeEnum.CREATE,
          resourceType: AccessResourceTypeEnum.REST_RESOURCE,
          resource: 12345,
          actorType: AccessActorTypeEnum.ROLE,
          actor: createRandomId(),
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should not update acl if actorType is not from allowed values', () => {
      return e2eTestingContainer
        .request()
        .put(`/acls/${createRandomId()}`)
        .send({
          accessPermission: AccessPermissionEnum.ALLOW,
          accessType: AccessTypeEnum.CREATE,
          resourceType: AccessResourceTypeEnum.REST_RESOURCE,
          resource: '/test-resource',
          actorType: 'string',
          actor: createRandomId(),
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('should not update acl if all required keys are not defined', () => {
      return e2eTestingContainer
        .request()
        .put(`/acls/${createRandomId()}`)
        .send({
          accessPermission: AccessPermissionEnum.ALLOW,
          accessType: AccessTypeEnum.CREATE,
          resourceType: AccessResourceTypeEnum.REST_RESOURCE,
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });
});
