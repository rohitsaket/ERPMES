import { Injectable, PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const { metatype } = metadata;

    if (!metatype || !this.isZodSchema(metatype)) {
      return value;
    }

    try {
      return metatype.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
        throw new BadRequestException(messages);
      }
      throw error;
    }
  }

  private isZodSchema(metatype: any): metatype is ZodSchema<any> {
    return metatype && typeof metatype.parse === 'function' && typeof metatype.safeParse === 'function';
  }
}