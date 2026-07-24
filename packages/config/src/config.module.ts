import { Module, Global } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { validateEnv } from './env';
import { FeatureFlagService } from './feature-flags';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      envFilePath: ['.env.local', '.env'],
    }),
  ],
  providers: [FeatureFlagService],
  exports: [NestConfigModule, FeatureFlagService],
})
export class ConfigModule {}
