import { Injectable } from '@nestjs/common';
import { find } from 'lodash';
import { Account, AccountMember } from '../../accounts';
import { Role } from '../../roles';
import { User } from '../../users';
import {
  AccessActorTypeEnum,
  AccessResourceTypeEnum,
  AccessTypeEnum,
} from '../enums';
import { AccessContext, AccessResource } from '../interfaces';

@Injectable()
export class AclGuardUtilsService {
  /**
   * Determines, whether the user is a member of an account or not.
   * @param account the context account object
   * @param userId the current
   */
  isMember(account: Account, userId: string): Boolean {
    const accountMember = this.findAccountMemberByUserId(account, userId);
    return !!accountMember;
  }

  /**
   * Finds a role of a user in the account.
   * @param account
   * @param userId
   */
  getUserRoleInAccount(account: Account, userId: string): Role {
    const accountMember = this.findAccountMemberByUserId(account, userId);
    if (!accountMember) {
      throw new Error('account member has not been found');
    }

    return accountMember.role as Role;
  }

  /**
   * Creates an AccessContext (used then to evaluate access control list)
   * @param userId
   * @param account
   * @param role
   */
  createAccessContext(
    userId: string,
    account: Account,
    role: Role
  ): AccessContext {
    return {
      userId,
      accountId: account._id.toString(),
      actorType: AccessActorTypeEnum.ROLE,
      actor: role._id.toString(),
    };
  }

  /**
   * Creates an AccessResource object. (used then to evaluate access control
   * list)
   * @param request
   * @param {AccessResourceTypeEnum} resourceType
   * @return {AccessResource}
   */
  createAccessResource(
    request: any,
    resourceType: AccessResourceTypeEnum
  ): AccessResource {
    const resource = request.originalUrl as string;
    return {
      resourceType,
      resource,
    };
  }

  /**
   * Determines the access type depending on request parameters.
   * @param request native express request object
   */
  getAccessType(request: any): AccessTypeEnum {
    if (!request.method) {
      throw new Error('can not resolve request method');
    }

    switch (request.method) {
      case 'POST':
        return AccessTypeEnum.CREATE;
      case 'GET':
        return AccessTypeEnum.READ;
      case 'PUT':
        return AccessTypeEnum.UPDATE;
      case 'DELETE':
        return AccessTypeEnum.DELETE;
      default:
        throw new Error(`request method ${request.method} is not supported`);
    }
  }

  private findAccountMemberByUserId(
    account: Account,
    userId: string
  ): AccountMember | null {
    return (
      find(account.members as AccountMember[], (member: AccountMember) => {
        return (member.user as User)._id.toString() === userId;
      }) || null
    );
  }
}
