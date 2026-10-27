import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiProtected } from '../common/decorators/api-protected.decorator';

@ApiTags('Favorites')
@ApiProtected()
@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: 'Saved books for the signed-in user.' })
  getMyFavorites(@CurrentUser() user: AuthUser) {
    return this.favoritesService.getMyFavorites(user.id);
  }

  @Post(':bookId')
  @ApiOperation({ summary: 'Save or unsave a published book.' })
  toggleFavorite(
    @CurrentUser() user: AuthUser,
    @Param('bookId') bookId: string,
  ) {
    return this.favoritesService.toggleFavorite(user.id, bookId);
  }

  @Get('check/:bookId')
  @ApiOperation({ summary: 'Whether the signed-in user has saved this book.' })
  checkIsFavorited(
    @CurrentUser() user: AuthUser,
    @Param('bookId') bookId: string,
  ) {
    return this.favoritesService.checkIsFavorited(user.id, bookId);
  }
}
