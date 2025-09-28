import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { EventBus } from '../../infrastructure/events';
import { LoginDto, AuthResponseDto, UserLoggedInEvent, UserLoggedOutEvent } from '@contracts';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private eventBus: EventBus,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await compare(password, user.password)) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const payload = { 
      sub: user.id, 
      email: user.email, 
      roles: user.roles,
      permissions: user.permissions 
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Store refresh token
    await this.usersService.storeRefreshToken(user.id, refreshToken);

    // Publish login event
    await this.eventBus.publish<UserLoggedInEvent>({
      eventType: 'user.logged-in',
      aggregateId: user.id,
      aggregateType: 'user',
      eventVersion: 1,
      payload: {
        userId: user.id,
        email: user.email,
        loginTime: new Date(),
        ipAddress,
        userAgent,
      },
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 3600, // 1 hour
    };
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.revokeRefreshTokens(userId);

    // Publish logout event
    await this.eventBus.publish<UserLoggedOutEvent>({
      eventType: 'user.logged-out',
      aggregateId: userId,
      aggregateType: 'user',
      eventVersion: 1,
      payload: {
        userId,
        logoutTime: new Date(),
      },
    });
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const decoded = this.jwtService.verify(refreshToken);
      const user = await this.usersService.findById(decoded.sub);
      
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const payload = { 
        sub: user.id, 
        email: user.email, 
        roles: user.roles,
        permissions: user.permissions 
      };

      const accessToken = this.jwtService.sign(payload);
      const newRefreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

      // Update refresh token
      await this.usersService.storeRefreshToken(user.id, newRefreshToken);

      return {
        accessToken,
        refreshToken: newRefreshToken,
        tokenType: 'Bearer',
        expiresIn: 3600,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}