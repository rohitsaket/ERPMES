import { BadRequestException } from '@nestjs/common';
import { QueryNormalizationPipe } from './query-normalization.pipe';

describe('QueryNormalizationPipe', () => {
  const pipe = new QueryNormalizationPipe();
  const queryMetadata = {
    type: 'query',
    metatype: Object,
    data: undefined,
  } as const;

  it('converts pagination query strings to integers', () => {
    expect(
      pipe.transform(
        { page: '2', limit: '50', offset: '0', search: 'ring' },
        queryMetadata,
      ),
    ).toEqual({ page: 2, limit: 50, offset: 0, search: 'ring' });
  });

  it.each([
    { page: '0' },
    { page: 'one' },
    { limit: '501' },
    { offset: '-1' },
  ])('rejects unsafe pagination values: %o', (query) => {
    expect(() => pipe.transform(query, queryMetadata)).toThrow(
      BadRequestException,
    );
  });

  it('does not modify request bodies', () => {
    const body = { page: '2', limit: '20' };
    expect(
      pipe.transform(body, {
        type: 'body',
        metatype: Object,
        data: undefined,
      }),
    ).toBe(body);
  });
});
