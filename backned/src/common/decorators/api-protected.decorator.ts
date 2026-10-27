import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiProtected(roles?: string) {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiUnauthorizedResponse({
      description: 'Missing, expired, or inactive access token.',
    }),
    ApiForbiddenResponse({
      description: roles
        ? `Only ${roles} can call this route.`
        : 'The signed-in role cannot call this route.',
    }),
  );
}
