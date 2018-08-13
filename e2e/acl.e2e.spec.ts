import { HttpStatus } from '@nestjs/common';
import { Account, AccountBindings, AccountSchema } from '../../accounts';
import { AccessToken } from '../../auth';
import { ProviderDefinition } from '../../common-interfaces';
import { DatabaseModule } from '../../database';
import {
  ExternalAuthMockService,
  ExternalAuthModule,
  ExternalAuthService,
} from '../../external-auth';
import { Role, RoleBindings, RoleSchema } from '../../roles';
import {
  createAccessToken,
  createAccount,
  createDefaultAccessToken,
  createUsers,
  E2ETestingContainer,
  E2ETestingModulesFactory,
  findAllUsers,
  findOneUser,
  FixtureLoader,
  FixtureLoaderConfig,
  inviteUser,
  JEST_E2E_TIMEOUT,
  MongooseFixturesService,
} from '../../testing';
import { CreateUserDto, User } from '../../users';
import { AclModule } from '../acl.module';
import { AclBindings } from '../bindings';
import { CreateAclDto } from '../dto';
import {
  AccessActorTypeEnum,
  AccessPermissionEnum,
  AccessResourceTypeEnum,
  AccessTypeEnum,
} from '../enums';

import { AclSchema } from '../schemas';
import { ProtectedModule } from './__test__/protected';

import { ROLES_FIXTURE, USER_PASSWORD, USERS_FIXTURE } from './acl.fixture';

jest.setTimeout(JEST_E2E_TIMEOUT);

describe('ACL', () => {
  let e2eTestingContainer: E2ETestingContainer;
  let mongooseFixturesService: MongooseFixturesService;
  let externalAuthMockService: ExternalAuthService | ExternalAuthMockService;
  let defaultAccessToken: AccessToken;

  beforeAll(async () => {
    const rolesFixtureLoaderConfig: FixtureLoaderConfig = {
      modelName: RoleBindings.MODEL_NAME,
      schema: RoleSchema,
    };

    const accountsFixtureLoaderConfig: FixtureLoaderConfig = {
      modelName: AccountBindings.MODEL_NAME,
      schema: AccountSchema,
    };

    const aclsFixtureLoaderConfig: FixtureLoaderConfig = {
      modelName: AclBindings.MODEL_NAME,
      schema: AclSchema,
    };

    const fixturesLoadersProvider: ProviderDefinition<
      FixtureLoader[]
    > = MongooseFixturesService.createFixturesLoadersProvider([
      rolesFixtureLoaderConfig,
      aclsFixtureLoaderConfig,
      accountsFixtureLoaderConfig,
    ]);

    e2eTestingContainer = E2ETestingModulesFactory.createModule({
      imports: [
        DatabaseModule.forRoot([fixturesLoadersProvider]),
        AclModule,
        ExternalAuthModule,
        ProtectedModule,
      ],
      providers: [MongooseFixturesService],
    });

    await e2eTestingContainer.compile();
    await e2eTestingContainer.start();
  });

  beforeEach(() => {
    mongooseFixturesService = e2eTestingContainer.module.get<
      MongooseFixturesService
    >(MongooseFixturesService);

    externalAuthMockService = e2eTestingContainer.module
      .select(ExternalAuthModule)
      .get(ExternalAuthService) as ExternalAuthMockService;
  });

  beforeEach(async () => {
    await (externalAuthMockService as ExternalAuthMockService).teardown();
    await mongooseFixturesService.clearFixtures();
    await mongooseFixturesService.loadFixtures({
      modelName: RoleBindings.MODEL_NAME,
      fixtures: ROLES_FIXTURE,
    });
    await createUsers(e2eTestingContainer, USERS_FIXTURE as CreateUserDto[]);
    defaultAccessToken = await createDefaultAccessToken(e2eTestingContainer);
  });

  afterAll(async (done: jest.DoneCallback) => {
    await (externalAuthMockService as ExternalAuthMockService).teardown();
    await mongooseFixturesService.teardown();
    await e2eTestingContainer.teardown();
    done();
  });

  describe('fixtures & dependencies', () => {
    let allRoles: Role[];
    let allUsers: User[];
    beforeEach(async () => {
      allRoles = await mongooseFixturesService.findAll(
        RoleBindings.MODEL_NAME,
        {}
      );
      allUsers = await findAllUsers(e2eTestingContainer, defaultAccessToken);
    });

    it('should have MongooseFixturesService', () => {
      expect(mongooseFixturesService).toBeDefined();
    });

    it('should gould load roles fixtures', () => {
      expect(allRoles).toBeDefined();
      expect(allRoles.length).toEqual(3);
    });
    it('should gould load users fixtures', () => {
      expect(allUsers).toBeDefined();
      // 3 are from fixtures, 1 is pre-created in the ExternalAuthMockService
      expect(allUsers.length).toEqual(4);
    });
  });

  describe('API', () => {
    let managerRole: Role;

    beforeEach(async () => {
      managerRole = await mongooseFixturesService.findOne(
        RoleBindings.MODEL_NAME,
        { roleName: 'MANAGER' }
      );
    });

    describe('POST /acls', () => {
      it('should create an acl instance', () => {
        const createAclDto: CreateAclDto = {
          accessPermission: AccessPermissionEnum.ALLOW,
          accessType: AccessTypeEnum.CREATE,
          resourceType: AccessResourceTypeEnum.REST_RESOURCE,
          resource: '/test-resource',
          actorType: AccessActorTypeEnum.ROLE,
          actor: managerRole._id,
        };

        return e2eTestingContainer
          .request()
          .post('/acls')
          .send(createAclDto)
          .expect(HttpStatus.CREATED);
      });
    });
  });

  describe('AclGuard', () => {
    let adminRole: Role;
    let managerRole: Role;
    let customerRole: Role;

    let userA: User;
    let userB: User;
    let userC: User;

    let accountA: Account;

    beforeEach(async () => {
      adminRole = (await mongooseFixturesService.findOne(
        RoleBindings.MODEL_NAME,
        { roleName: 'ADMIN' }
      )) as Role;
      managerRole = (await mongooseFixturesService.findOne(
        RoleBindings.MODEL_NAME,
        { roleName: 'MANAGER' }
      )) as Role;
      customerRole = (await mongooseFixturesService.findOne(
        RoleBindings.MODEL_NAME,
        { roleName: 'CUSTOMER' }
      )) as Role;

      userA = await findOneUser(
        e2eTestingContainer,
        'userA@mail.com',
        defaultAccessToken
      );
      userB = await findOneUser(
        e2eTestingContainer,
        'userB@mail.com',
        defaultAccessToken
      );
      userC = await findOneUser(
        e2eTestingContainer,
        'userC@mail.com',
        defaultAccessToken
      );

      await createAccount(
        e2eTestingContainer,
        'accountA',
        userA,
        defaultAccessToken
      );

      accountA = (await mongooseFixturesService.findOne(
        AccountBindings.MODEL_NAME,
        { name: 'accountA' }
      )) as Account;

      await inviteUser(
        e2eTestingContainer,
        accountA,
        userB,
        managerRole,
        defaultAccessToken
      );
      await inviteUser(
        e2eTestingContainer,
        accountA,
        userC,
        customerRole,
        defaultAccessToken
      );

      // give the full access for ADMIN's to the "/protected" REST_RESOURCE
      await createAcl({
        accessPermission: AccessPermissionEnum.ALLOW,
        accessType: AccessTypeEnum.ANY,
        resourceType: AccessResourceTypeEnum.REST_RESOURCE,
        resource: '/protected',
        actorType: AccessActorTypeEnum.ROLE,
        actor: adminRole._id.toString(),
      });
      await createAcl({
        accessPermission: AccessPermissionEnum.ALLOW,
        accessType: AccessTypeEnum.ANY,
        resourceType: AccessResourceTypeEnum.REST_RESOURCE,
        resource: '/protected/*',
        actorType: AccessActorTypeEnum.ROLE,
        actor: adminRole._id.toString(),
      });

      // allow managers to UPDATE and READ "/protected" REST_RESOURCE but deny
      // CREATE or DELETE
      await createAcl({
        accessPermission: AccessPermissionEnum.DENY,
        accessType: AccessTypeEnum.CREATE,
        resourceType: AccessResourceTypeEnum.REST_RESOURCE,
        resource: '/protected',
        actorType: AccessActorTypeEnum.ROLE,
        actor: managerRole._id.toString(),
      });
      await createAcl({
        accessPermission: AccessPermissionEnum.DENY,
        accessType: AccessTypeEnum.DELETE,
        resourceType: AccessResourceTypeEnum.REST_RESOURCE,
        resource: '/protected/*',
        actorType: AccessActorTypeEnum.ROLE,
        actor: managerRole._id.toString(),
      });
      await createAcl({
        accessPermission: AccessPermissionEnum.ALLOW,
        accessType: AccessTypeEnum.ANY,
        resourceType: AccessResourceTypeEnum.REST_RESOURCE,
        resource: '/protected',
        actorType: AccessActorTypeEnum.ROLE,
        actor: managerRole._id.toString(),
      });
      await createAcl({
        accessPermission: AccessPermissionEnum.ALLOW,
        accessType: AccessTypeEnum.ANY,
        resourceType: AccessResourceTypeEnum.REST_RESOURCE,
        resource: '/protected/*',
        actorType: AccessActorTypeEnum.ROLE,
        actor: managerRole._id.toString(),
      });

      // allow CUSTOMERS to only READ "/protected" REST_RESOURCE
      await createAcl({
        accessPermission: AccessPermissionEnum.DENY,
        accessType: AccessTypeEnum.ANY,
        resourceType: AccessResourceTypeEnum.REST_RESOURCE,
        resource: '/protected',
        actorType: AccessActorTypeEnum.ROLE,
        actor: customerRole._id.toString(),
      });
      await createAcl({
        accessPermission: AccessPermissionEnum.DENY,
        accessType: AccessTypeEnum.ANY,
        resourceType: AccessResourceTypeEnum.REST_RESOURCE,
        resource: '/protected/*',
        actorType: AccessActorTypeEnum.ROLE,
        actor: customerRole._id.toString(),
      });
      await createAcl({
        accessPermission: AccessPermissionEnum.ALLOW,
        accessType: AccessTypeEnum.READ,
        resourceType: AccessResourceTypeEnum.REST_RESOURCE,
        resource: '/protected',
        actorType: AccessActorTypeEnum.ROLE,
        actor: customerRole._id.toString(),
      });
      await createAcl({
        accessPermission: AccessPermissionEnum.ALLOW,
        accessType: AccessTypeEnum.READ,
        resourceType: AccessResourceTypeEnum.REST_RESOURCE,
        resource: '/protected/*',
        actorType: AccessActorTypeEnum.ROLE,
        actor: customerRole._id.toString(),
      });
    });

    describe('userA, an ADMIN in the context of its own accountA', () => {
      let userAAccessToken: AccessToken;

      beforeEach(async () => {
        userAAccessToken = await createAccessToken(
          e2eTestingContainer,
          userA,
          USER_PASSWORD
        );
      });

      it('should be able to create /protected resource', () => {
        return e2eTestingContainer
          .request()
          .post('/protected')
          .send({ foo: 'bar' })
          .set('Authorization', `Bearer ${userAAccessToken.accessToken}`)
          .set('Account', `${accountA._id}`)
          .expect(HttpStatus.CREATED);
      });

      it('should be able to read /protected resource', () => {
        return e2eTestingContainer
          .request()
          .get('/protected')
          .set('Authorization', `Bearer ${userAAccessToken.accessToken}`)
          .set('Account', `${accountA._id}`)
          .expect(HttpStatus.OK);
      });

      it('should be able to update /protected resource', () => {
        return e2eTestingContainer
          .request()
          .put('/protected/some_id')
          .set('Authorization', `Bearer ${userAAccessToken.accessToken}`)
          .set('Account', `${accountA._id}`)
          .expect(HttpStatus.OK);
      });

      it('should be able to delete /protected resource', () => {
        return e2eTestingContainer
          .request()
          .delete('/protected/some_id')
          .set('Authorization', `Bearer ${userAAccessToken.accessToken}`)
          .set('Account', `${accountA._id}`)
          .expect(HttpStatus.OK);
      });
    });

    describe('userB, a MANAGER in the context of accountA', () => {
      let userBAccessToken: AccessToken;

      beforeEach(async () => {
        userBAccessToken = await createAccessToken(
          e2eTestingContainer,
          userB,
          USER_PASSWORD
        );
      });

      it('should not be able to create /protected resource', () => {
        return e2eTestingContainer
          .request()
          .post('/protected')
          .send({ foo: 'bar' })
          .set('Authorization', `Bearer ${userBAccessToken.accessToken}`)
          .set('Account', `${accountA._id}`)
          .expect(HttpStatus.FORBIDDEN);
      });

      it('should be able to update /protected/:id resource', () => {
        return e2eTestingContainer
          .request()
          .put('/protected/some_id')
          .send({ foo: 'bar' })
          .set('Authorization', `Bearer ${userBAccessToken.accessToken}`)
          .set('Account', `${accountA._id}`)
          .expect(HttpStatus.OK);
      });

      it('should be able to read /protected resource', () => {
        return e2eTestingContainer
          .request()
          .get('/protected')
          .set('Authorization', `Bearer ${userBAccessToken.accessToken}`)
          .set('Account', `${accountA._id}`)
          .expect(HttpStatus.OK);
      });

      it('should be able to read /protected/:id resource', () => {
        return e2eTestingContainer
          .request()
          .get('/protected/some_id')
          .set('Authorization', `Bearer ${userBAccessToken.accessToken}`)
          .set('Account', `${accountA._id}`)
          .expect(HttpStatus.OK);
      });

      it('should not be able to delete /protected/:id resource', () => {
        return e2eTestingContainer
          .request()
          .delete('/protected/some_id')
          .set('Authorization', `Bearer ${userBAccessToken.accessToken}`)
          .set('Account', `${accountA._id}`)
          .expect(HttpStatus.FORBIDDEN);
      });
    });

    describe('userC, a CUSTOMER in the context of accountA', () => {
      let userCAccessToken: AccessToken;

      beforeEach(async () => {
        userCAccessToken = await createAccessToken(
          e2eTestingContainer,
          userC,
          USER_PASSWORD
        );
      });

      it('should be able to read /protected resource', () => {
        return e2eTestingContainer
          .request()
          .get('/protected')
          .set('Authorization', `Bearer ${userCAccessToken.accessToken}`)
          .set('Account', `${accountA._id}`)
          .expect(HttpStatus.OK);
      });

      it('should not be able to create /protected resource', () => {
        return e2eTestingContainer
          .request()
          .post('/protected')
          .send({ foo: 'bar' })
          .set('Authorization', `Bearer ${userCAccessToken.accessToken}`)
          .set('Account', `${accountA._id}`)
          .expect(HttpStatus.FORBIDDEN);
      });

      it('should not be able to update /protected resource', () => {
        return e2eTestingContainer
          .request()
          .put('/protected/id')
          .send({ foo: 'bar' })
          .set('Authorization', `Bearer ${userCAccessToken.accessToken}`)
          .set('Account', `${accountA._id}`)
          .expect(HttpStatus.FORBIDDEN);
      });
    });
  });

  /* ************************************************ */

  async function createAcl(createAclDto: CreateAclDto): Promise<void> {
    await e2eTestingContainer
      .request()
      .post('/acls')
      .send(createAclDto)
      .expect(HttpStatus.CREATED);
  }
});
