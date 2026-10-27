import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseEnumPipe,
} from '@nestjs/common';
import { BorrowService } from './borrow.service';
import { CreateBorrowDto } from './dto/create-borrow.dto';
import { UpdateBorrowStatusDto } from './dto/update-borrow-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { BorrowStatus, Role } from '@prisma/client';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiProtected } from '../common/decorators/api-protected.decorator';

@ApiTags('Borrow')
@Controller('borrow')
export class BorrowController {
  constructor(private readonly borrowService: BorrowService) {}

  // User submits borrow request
  @Post(':bookId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN)
  @ApiProtected('USER, ADMIN')
  @ApiOperation({ summary: 'Request a loan for a published book that is in stock. Authors cannot borrow.' })
  requestBorrow(
    @CurrentUser() user: AuthUser,
    @Param('bookId') bookId: string,
    @Body() dto: CreateBorrowDto,
  ) {
    return this.borrowService.requestBorrow(user.id, bookId, dto);
  }

  // User views their own borrow history
  @Get('my-records')
  @UseGuards(JwtAuthGuard)
  @ApiProtected()
  @ApiOperation({ summary: 'The signed-in user’s loan history.' })
  getMyRecords(@CurrentUser() user: AuthUser) {
    return this.borrowService.getMyRecords(user.id);
  }

  // Admin views all borrow records
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiProtected('ADMIN')
  @ApiOperation({ summary: 'Every loan, optionally filtered by status.' })
  @ApiQuery({ name: 'status', required: false, enum: BorrowStatus })
  getAllRecords(
    @Query('status', new ParseEnumPipe(BorrowStatus, { optional: true }))
    status?: BorrowStatus,
  ) {
    return this.borrowService.getAllRecords(status);
  }

  // Admin updates borrow status (Approve, mark returned, etc.)
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiProtected('ADMIN')
  @ApiOperation({ summary: 'Move a loan to the next status. Stock changes when a copy goes out or comes back.' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBorrowStatusDto,
  ) {
    return this.borrowService.updateStatus(id, dto.status);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiProtected()
  @ApiOperation({ summary: 'Cancel your own request before the copy has been borrowed.' })
  cancelOwn(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.borrowService.cancelOwn(user.id, id);
  }

  @Post(':id/return-request')
  @UseGuards(JwtAuthGuard)
  @ApiProtected()
  @ApiOperation({ summary: 'Ask to return a borrowed or overdue copy. An admin confirms the return.' })
  requestReturn(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.borrowService.requestReturn(user.id, id);
  }
}
