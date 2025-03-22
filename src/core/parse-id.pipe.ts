import { ParseIntPipe, ArgumentMetadata, Injectable, PipeTransform, UnprocessableEntityException } from '@nestjs/common';

@Injectable()
export class ParseIdPipe extends ParseIntPipe {
  async transform(value: string, metadata: ArgumentMetadata): Promise<number> {
    const id = await super.transform(value, metadata);
    if (id <= 0) {
      throw this.exceptionFactory(
        'Validation failed (value greater than 0 is expected)',
      );
    }
    return id;
  }
}

@Injectable()
export class CheckNotEmptyPipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (!value) {
      throw new UnprocessableEntityException(`${metadata.data ?? 'field'} is required`)
    }
    return value
  }
}
