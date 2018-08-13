import { Module } from '@nestjs/common';
import { AccountsModule } from '../accounts';
import { DatabaseModule } from '../database';
import { RolesModule } from '../roles';
import { AclController } from './acl.controller';
import { AclService } from './acl.service';
import { AclEvaluatorService, AclGuard, AclGuardUtilsService } from './guards';

import { aclModelProvider } from './providers';

/**
 * Provides the flexible access control
 * Using the AccessControlLists (`Acl`)
 * */
@Module({
  imports: [
    DatabaseModule.forRoot([aclModelProvider]),
    RolesModule,
    AccountsModule,
  ],
  controllers: [AclController],
  providers: [AclService, AclGuardUtilsService, AclEvaluatorService, AclGuard],
  exports: [AclService, AclGuardUtilsService, AclEvaluatorService, AclGuard],
})
export class AclModule {}
