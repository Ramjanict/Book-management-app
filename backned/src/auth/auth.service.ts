import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto, RegisterRole } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { TokenService } from './token/token.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  // register
  async registerUser(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const role = dto.role === RegisterRole.AUTHOR ? Role.AUTHOR : Role.USER;

    const alreadyExists = await this.prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });
    if (alreadyExists) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name: dto.name.trim(),
          email,
          password: hashedPassword,
          role,
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (role === Role.AUTHOR) {
        await tx.authorProfile.create({
          data: {
            userId: created.id,
            penName: dto.penName?.trim() || created.name,
            bio: dto.bio?.trim(),
            website: dto.website,
          },
        });
      }

      return created;
    });

    return { message: 'User registered successfully', user };
  }

  // login
  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const { password } = dto;

    // Check if user exists
    const user = await this.prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });
    const passwordMatches = user
      ? await bcrypt.compare(password, user.password)
      : false;

    if (!user || !passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status === 'BLOCKED') {
      throw new UnauthorizedException('Your account has been blocked');
    }

    if (user.status === 'PENDING') {
      throw new UnauthorizedException('Your account is not active');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.generateAccessToken(payload),
      this.tokenService.generateRefreshToken(payload),
    ]);

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    // await this.prisma.user.update({
    //   where: { id: user.id },
    //   data: {
    //     refreshToken: hashedRefreshToken,
    //   },
    // });
    const expiresAt = new Date();

    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: hashedRefreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      message: 'User logged in successfully',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  // refresh token
  async refreshToken(dto: RefreshTokenDto) {
    const { refreshToken } = dto;

    // Verify refresh JWT
    let payload: {
      sub: string;
      email: string;
      role: string;
    };

    try {
      payload = await this.tokenService.verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Find all active sessions for user
    const sessions = await this.prisma.refreshToken.findMany({
      where: {
        userId: payload.sub,
        revokedAt: null,
      },
    });

    // Find matching hashed token
    let matchedSession: (typeof sessions)[number] | null = null;

    for (const session of sessions) {
      const matches = await bcrypt.compare(refreshToken, session.tokenHash);

      if (matches) {
        matchedSession = session;
        break;
      }
    }

    if (!matchedSession) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check expiration
    if (matchedSession.expiresAt <= new Date()) {
      await this.prisma.refreshToken.update({
        where: {
          id: matchedSession.id,
        },
        data: {
          revokedAt: new Date(),
        },
      });

      throw new UnauthorizedException('Refresh token expired');
    }

    // Get current user
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Your account is not active');
    }

    // New payload
    const newPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    // Generate new tokens
    const [accessToken, newRefreshToken] = await Promise.all([
      this.tokenService.generateAccessToken(newPayload),

      this.tokenService.generateRefreshToken(newPayload),
    ]);

    // Revoke old refresh token
    await this.prisma.refreshToken.update({
      where: {
        id: matchedSession.id,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    // Hash new refresh token
    const newTokenHash = await bcrypt.hash(newRefreshToken, 12);

    // New expiration
    const expiresAt = new Date();

    expiresAt.setDate(expiresAt.getDate() + 7);

    // Store new refresh session
    await this.prisma.refreshToken.create({
      data: {
        tokenHash: newTokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      message: 'Token refreshed successfully',
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(dto: RefreshTokenDto) {
    let payload: { sub: string };

    try {
      payload = await this.tokenService.verifyRefreshToken(dto.refreshToken);
    } catch {
      return { message: 'Logged out' };
    }

    const sessions = await this.prisma.refreshToken.findMany({
      where: { userId: payload.sub, revokedAt: null },
    });

    for (const session of sessions) {
      const matches = await bcrypt.compare(dto.refreshToken, session.tokenHash);
      if (!matches) {
        continue;
      }

      if (!session.revokedAt) {
        await this.prisma.refreshToken.update({
          where: { id: session.id },
          data: { revokedAt: new Date() },
        });
      }
      break;
    }

    return { message: 'Logged out' };
  }

  // current user
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        authorProfile: {
          select: {
            id: true,
            penName: true,
            bio: true,
            website: true,
            socialLinks: true,
          },
        },
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // forgot password
  async forgotPassword(dto: ForgotPasswordDto) {
    const { email } = dto;

    const user = await this.prisma.user.findFirst({
      where: { email: { equals: email.trim().toLowerCase(), mode: 'insensitive' } },
    });

    // Do not reveal whether the email exists.
    if (!user) {
      return {
        message:
          'If an account exists with this email, a password reset link has been sent.',
      };
    }

    // Delete old unused reset tokens
    await this.prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
    });

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex');

    // Hash token before storing
    const tokenHash = createHash('sha256').update(resetToken).digest('hex');

    // Token valid for 15 minutes
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.passwordResetToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;

    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`Password reset URL: ${resetUrl}`);
    }

    return {
      message:
        'If an account exists with this email, a password reset link has been sent.',
    };
  }

  // reset password
  async resetPassword(dto: ResetPasswordDto) {
    const { token, newPassword } = dto;

    // Hash the token received from the user
    const tokenHash = createHash('sha256').update(token).digest('hex');

    // Find token
    const resetToken = await this.prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
      },
    });

    if (!resetToken) {
      throw new UnauthorizedException(
        'Invalid or expired password reset token',
      );
    }

    // Check expiration
    if (resetToken.expiresAt <= new Date()) {
      throw new UnauthorizedException(
        'Invalid or expired password reset token',
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and invalidate token
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: {
          id: resetToken.userId,
        },
        data: {
          password: hashedPassword,
        },
      }),

      this.prisma.passwordResetToken.update({
        where: {
          id: resetToken.id,
        },
        data: {
          usedAt: new Date(),
        },
      }),

      // Revoke all refresh sessions
      this.prisma.refreshToken.updateMany({
        where: {
          userId: resetToken.userId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      }),
    ]);

    return {
      message: 'Password reset successfully. Please login again.',
    };
  }
}
