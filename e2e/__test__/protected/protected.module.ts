import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AccountsModule } from '../../../../accounts';
import { AuthMiddleware, AuthModule } from '../../../../auth';
import { RolesModule } from '../../../../roles';

import { UsersModule } from '../../../../users';
import { AclModule } from '../../../acl.module';

import { ProtectedController } from './protected.controller';

@Module({
  imports: [RolesModule, UsersModule, AuthModule, AccountsModule, AclModule],
  controllers: [ProtectedController],
})
export class ProtectedModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(ProtectedController);
  }
}
