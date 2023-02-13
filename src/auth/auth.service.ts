import * as bcrypt from 'bcrypt';
import { JwtPayload } from 'jsonwebtoken';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../users/schemas/user.schema';
import { UsersRepository } from '../users/users.repository';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { EmailManager } from '../managers/email.manager';
import { LoginUserDto } from './dto/login-user.dto';
import { validateOrRejectInputDto } from '../common/utils';
import { JwtService } from './jwt.service';
import {
  ACCESS_TOKEN_LIFE_TIME,
  REFRESH_TOKEN_LIFE_TIME,
} from '../common/constants';
import { TokensPair } from '../common/types';

@Injectable()
export class AuthService {
  constructor(
    protected usersRepository: UsersRepository,
    protected emailManager: EmailManager,
    protected jwtService: JwtService,
    @InjectModel(User.name) protected UserModel: UserModelType,
  ) {}

  async registerUser(
    createUserDto: CreateUserDto,
    isConfirmedByDefault?: boolean,
  ): Promise<string> {
    await validateOrRejectInputDto(createUserDto, CreateUserDto);

    const { password } = createUserDto;
    const passwordHash = await this.generatePasswordHash(password);
    const createdUser = await this.UserModel.createUserEntity(
      createUserDto,
      passwordHash,
      isConfirmedByDefault,
      this.UserModel,
    );
    const savedUser = await this.usersRepository.saveUser(createdUser);
    const savedUserId = String(savedUser._id);

    try {
      await this.emailManager.sendRegistrationEmail(createdUser);
      return savedUserId;
    } catch (error) {
      await this.usersRepository.deleteUser(savedUserId);
      throw new Error(error);
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<TokensPair> {
    await validateOrRejectInputDto(loginUserDto, LoginUserDto);

    const { loginOrEmail, password } = loginUserDto;
    const userId = await this.checkCredentials(loginOrEmail, password);

    if (!userId) throw new UnauthorizedException();

    const { accessToken, refreshToken } = await this.createNewTokensPair(
      { userId },
      ACCESS_TOKEN_LIFE_TIME,
      { userId },
      REFRESH_TOKEN_LIFE_TIME,
    );

    return { accessToken, refreshToken };

    //TODO : need to do it when devices and sessions will be added

    // const deviceId = uuidv4();

    // if (userId) {
    //   const { accessToken, refreshToken } = await this
    //     .createNewTokensPair({userId}, "10m", {userId, deviceId}, "1h");
    //
    //   const refreshTokenPayload = await this.jwtService.getTokenPayload(refreshToken);
    //
    //   const deviceSessionData: EntityWithoutId<DeviceSession> = {
    //     issuedAt: refreshTokenPayload?.iat,
    //     expiredDate: refreshTokenPayload?.exp,
    //     deviceId: refreshTokenPayload!.deviceId,
    //     deviceName: req.headers["user-agent"],
    //     ip: req.ip,
    //     userId: new ObjectId(userId)
    //   };
    //
    //   await this.authService.createDeviceSession(deviceSessionData);
    //
    //   res
    //     .cookie("refreshToken", refreshToken, {httpOnly: true, secure: true})
    //     .status(200)
    //     .send({accessToken: accessToken});
    // } else {
    //   res.sendStatus(401);
    // }
  }

  async checkCredentials(
    loginOrEmail: string,
    password: string,
  ): Promise<string | null> {
    const user = await this.usersRepository.findUserByFilter({
      login: loginOrEmail,
      email: loginOrEmail,
    });

    if (!user) return null;

    const isMatchedUser = await bcrypt.compare(password, user.passwordHash);

    return isMatchedUser ? String(user._id) : null;
  }

  private async generatePasswordHash(password: string): Promise<string> {
    const passwordSalt = await bcrypt.genSalt(10);

    return bcrypt.hash(password, passwordSalt);
  }

  private async createNewTokensPair(
    accessTokenPayload: JwtPayload,
    accessTokenLifetime: string,
    refreshTokenPayload: JwtPayload,
    refreshTokenLifetime: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.jwtService.createJWT(
      { ...accessTokenPayload, iat: Date.now() },
      accessTokenLifetime,
    );
    const refreshToken = await this.jwtService.createJWT(
      { ...refreshTokenPayload, iat: Date.now() },
      refreshTokenLifetime,
    );

    return { accessToken, refreshToken };
  }
}
