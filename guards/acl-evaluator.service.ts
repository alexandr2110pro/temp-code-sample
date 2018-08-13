import { Injectable } from '@nestjs/common';
import { filter, find, orderBy } from 'lodash';
import { makeRe } from 'minimatch';
import {
  AccessPermissionEnum,
  AccessResourceTypeEnum,
  AccessTypeEnum,
} from '../enums';
import { AccessContext, AccessResource, Acl } from '../interfaces';

@Injectable()
export class AclEvaluatorService {
  /**
   * Evaluates passed ACL items using the provided accessType, AccessResource
   * and AccessContent.
   *
   * Under
   *
   * @param {Acl[]} aclItems
   * @param {AccessTypeEnum} accessType
   * @param {AccessResource} resource
   * @param {AccessContext} context
   * @return {AccessPermissionEnum}
   */
  evaluate(
    aclItems: Acl[],
    accessType: AccessTypeEnum,
    resource: AccessResource,
    context: AccessContext
  ): AccessPermissionEnum {
    if (aclItems.length === 0) {
      return AccessPermissionEnum.ALLOW;
    }

    const exactMatch = find(aclItems, {
      accessType: accessType as string,
      resource: resource.resource,
    });

    if (exactMatch) {
      return exactMatch.accessPermission as AccessPermissionEnum;
    }

    try {
      const relevantAcls = this.getRelevantAcls(aclItems, accessType);
      const scoredAcls = orderBy(
        this.scoreAcls(relevantAcls, resource),
        'score',
        'desc'
      );

      return scoredAcls[0].acl.accessPermission as AccessPermissionEnum;
    } catch (err) {
      throw err;
    }
  }

  private getRelevantAcls(aclItems: Acl[], accessType: AccessTypeEnum): Acl[] {
    return filter(aclItems, (item: Acl) => {
      const itemAccessType = item.accessType as AccessTypeEnum;
      return (
        itemAccessType === AccessTypeEnum.ANY || itemAccessType === accessType
      );
    });
  }

  private scoreAcls(
    relevantAcls: Acl[],
    resource: AccessResource
  ): { acl: Acl; score: number }[] {
    return relevantAcls.map((acl: Acl) => ({
      acl,
      score: this.calculateACLItemScore(acl, resource),
    }));
  }

  private calculateACLItemScore(
    acl: Acl,
    accessResource: AccessResource
  ): number {
    // Currently supports only REST_RESOURCE access resource type
    if (accessResource.resourceType !== AccessResourceTypeEnum.REST_RESOURCE) {
      throw new Error(
        `AccessResourceTypeEnum.REST_RESOURCE resource type is not supported`
      );
    }

    const aclResource = acl.resource as string;
    const aclAccessType = acl.accessType as string;

    if (aclResource === accessResource.resource) return 500;
    if (!makeRe(aclResource).test(accessResource.resource)) {
      return 0;
    }

    // any other access type rather than `AccessTypeEnum.ANY` wins.
    const accessTypeScore =
      aclAccessType === (AccessTypeEnum.ANY as string) ? 1 : 2;

    const matchedSegments = aclResource
      .replace(/\*\*$/, '')
      .match(/\//g) as any[];

    return matchedSegments.length * 10 + accessTypeScore;
  }
}
