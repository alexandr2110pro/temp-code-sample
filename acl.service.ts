import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

import { RolesService } from '../roles';

import { AclBindings } from './bindings';
import { CreateAclDto, FindAclQueryDto, UpdateAclDto } from './dto';
import { AccessActorTypeEnum } from './enums';
import { Acl } from './interfaces';

@Injectable()
export class AclService {
  constructor(
    @Inject(AclBindings.MODEL) private readonly aclModel: Model<Acl>,
    private readonly rolesService: RolesService
  ) {}

  async create(createRoleDto: CreateAclDto): Promise<void> {
    const acl = new this.aclModel(createRoleDto);
    await acl.save();
  }

  async find(filter: FindAclQueryDto): Promise<Acl[]> {
    return await this.aclModel.find(filter).exec();
  }

  async findOne(filter: FindAclQueryDto): Promise<Acl | null> {
    const found = await this.aclModel.findOne(filter).exec();

    if (!found) {
      throw new HttpException(`Can't find acl`, HttpStatus.NOT_FOUND);
    }

    return await this.populateActor(found);
  }

  async findById(id: string): Promise<Acl | null> {
    const found = await this.aclModel.findById(id).exec();

    if (!found) {
      throw new HttpException(`Can't find acl`, HttpStatus.NOT_FOUND);
    }

    return await this.populateActor(found);
  }

  async removeById(id: string): Promise<Acl | null> {
    return await this.aclModel.findByIdAndRemove(id).exec();
  }

  async update(id: string, updateAclDto: UpdateAclDto): Promise<Acl | null> {
    const updated = await this.aclModel
      .findByIdAndUpdate(id, updateAclDto)
      .exec();

    if (!updated) {
      throw new HttpException(`Can't find acl`, HttpStatus.NOT_FOUND);
    }

    return await this.populateActor(updated);
  }

  private async populateActor(found: Acl): Promise<Acl> {
    if (found.actorType === AccessActorTypeEnum.ROLE) {
      const role = await this.rolesService.findById(found.actor as string);
      if (!role) {
        throw new HttpException(
          `Can't populate ACL, Role ${found.actor} does not exist`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
      found.actor = role;
    }
    return found;
  }
}
