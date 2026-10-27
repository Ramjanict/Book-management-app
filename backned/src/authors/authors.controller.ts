import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/role.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { AuthorsService } from './authors.service';
import { UpdateAuthorProfileDto } from './dto/update-author-profile.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiProtected } from '../common/decorators/api-protected.decorator';

@ApiTags('Authors')
@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AUTHOR, Role.ADMIN)
  @ApiProtected('AUTHOR, ADMIN')
  @ApiOperation({ summary: 'The signed-in author’s profile.' })
  getMine(@CurrentUser() user: AuthUser) {
    return this.authorsService.getMine(user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AUTHOR, Role.ADMIN)
  @ApiProtected('AUTHOR, ADMIN')
  @ApiOperation({ summary: 'Update pen name, bio, website, and social links. Creates a profile if needed.' })
  updateMine(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateAuthorProfileDto,
  ) {
    return this.authorsService.updateMine(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Public author page by profile id or user id. Only published books are included.' })
  findPublic(@Param('id') id: string) {
    return this.authorsService.findPublic(id);
  }
}
