import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

const INTEGER_QUERY_LIMITS = {
  page: { min: 1, max: Number.MAX_SAFE_INTEGER },
  limit: { min: 1, max: 500 },
  offset: { min: 0, max: Number.MAX_SAFE_INTEGER },
} as const;

type IntegerQueryKey = keyof typeof INTEGER_QUERY_LIMITS;

@Injectable()
export class QueryNormalizationPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata) {
    if (
      metadata.type !== 'query' ||
      value === null ||
      typeof value !== 'object' ||
      Array.isArray(value)
    ) {
      return value;
    }

    const normalized = { ...(value as Record<string, unknown>) };

    for (const key of Object.keys(INTEGER_QUERY_LIMITS) as IntegerQueryKey[]) {
      const rawValue = normalized[key];
      if (rawValue === undefined || rawValue === '') continue;

      const parsedValue =
        typeof rawValue === 'number'
          ? rawValue
          : typeof rawValue === 'string' && /^\d+$/.test(rawValue)
            ? Number(rawValue)
            : Number.NaN;
      const limits = INTEGER_QUERY_LIMITS[key];

      if (
        !Number.isSafeInteger(parsedValue) ||
        parsedValue < limits.min ||
        parsedValue > limits.max
      ) {
        throw new BadRequestException(
          `${key} must be an integer between ${limits.min} and ${limits.max}`,
        );
      }

      normalized[key] = parsedValue;
    }

    return normalized;
  }
}
