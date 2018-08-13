import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';

import { Account, AccountsService } from '../../accounts';

import { AclService } from '../acl.service';
import { AccessPermissionEnum, AccessResourceTypeEnum } from '../enums';
import { AclEvaluatorService } from './acl-evaluator.service';
import { AclGuardUtilsService } from './acl-guard-utils.service';

@Injectable()
export class AclGuard implements CanActivate {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly aclService: AclService,
    private readonly aclGuardService: AclGuardUtilsService,
    private readonly aclEvaluatorService: AclEvaluatorService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // check if user object exists on the request
    // if not - return 404
    const request = context.switchToHttp().getRequest();
    const user = request.user as { id: string; email: string } | undefined;
    if (!user) {
      throw new HttpException(
        'User is not authorized',
        HttpStatus.UNAUTHORIZED
      );
    }

    // check if the account exists on the request headers
    // if not - return 400(?)
    const contextAccountId = request.headers['account'];
    if (!contextAccountId) {
      throw new HttpException(
        '"Account" header is missing',
        HttpStatus.BAD_REQUEST
      );
    }

    // it always exist, because before the guard, we have an authmiddleware.
    // so if this is executed, then the authorization has been already checked.
    const authorizationHeader = request.headers.authorization;

    const contextAccount = (await this.accountsService.findById(
      contextAccountId,
      authorizationHeader
    )) as Account;

    if (!contextAccount) {
      throw new HttpException(
        'context account does not exist',
        HttpStatus.BAD_REQUEST
      );
    }

    // check if the current user is a member of the context account.
    // if not - return 403
    const isMember = this.aclGuardService.isMember(contextAccount, user.id);
    if (!isMember) {
      throw new HttpException(
        'Current user is not a member of the context account',
        HttpStatus.FORBIDDEN
      );
    }

    const role = this.aclGuardService.getUserRoleInAccount(
      contextAccount,
      user.id
    );

    if (!role) {
      throw new HttpException(
        'Can not resolve user role',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    const accessType = this.aclGuardService.getAccessType(request);

    // in this guard, we're only checking the `REST_RESOURCE` resource type.
    const resourceType = AccessResourceTypeEnum.REST_RESOURCE;
    const accessResource = this.aclGuardService.createAccessResource(
      request,
      resourceType
    );

    const accessContext = this.aclGuardService.createAccessContext(
      user.id,
      contextAccount,
      role
    );

    // get relevant acl items
    const aclItems = await this.aclService.find({
      resourceType: accessResource.resourceType,
      actorType: accessContext.actorType,
      actor: accessContext.actor,
    });

    const permission = this.aclEvaluatorService.evaluate(
      aclItems,
      accessType,
      accessResource,
      accessContext
    );

    return permission === AccessPermissionEnum.ALLOW;
  }
}
