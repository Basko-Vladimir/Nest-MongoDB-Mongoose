import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { usersConstants } from '../../common/constants';
import {
  generateLengthErrorMessage,
  generateRegExpError,
} from '../../common/error-messages';
import { CreateUserDto } from '../api/dto/create-user.dto';
import { HydratedDocument, Model } from 'mongoose';
import {
  EmailConfirmation,
  EmailConfirmationSchema,
} from './email-confirmation.schema';
import { generateExistingFieldError } from '../../common/error-messages';

const { MIN_LOGIN_LENGTH, MAX_LOGIN_LENGTH, LOGIN_REG_EXP, EMAIL_REG_EXP } =
  usersConstants;

@Schema({ timestamps: true })
export class User {
  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: [
      MIN_LOGIN_LENGTH,
      generateLengthErrorMessage('login', MIN_LOGIN_LENGTH, 'min'),
    ],
    maxlength: [
      MAX_LOGIN_LENGTH,
      generateLengthErrorMessage('login', MAX_LOGIN_LENGTH, 'max'),
    ],
    validate: [LOGIN_REG_EXP, generateRegExpError('login', LOGIN_REG_EXP)],
  })
  login: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    validate: [EMAIL_REG_EXP, generateRegExpError('email', EMAIL_REG_EXP)],
  })
  email: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  passwordHash: string;

  @Prop({
    type: String,
    default: null,
  })
  passwordRecoveryCode: string;

  @Prop({
    required: true,
    type: EmailConfirmationSchema,
  })
  emailConfirmation: EmailConfirmation;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  confirmUserRegistration(user: UserDocument): UserDocument {
    user.emailConfirmation.isConfirmed = true;
    return user;
  }

  updateConfirmationCode(user: UserDocument): UserDocument {
    user.emailConfirmation.confirmationCode = uuidv4();
    user.emailConfirmation.expirationDate = add(new Date(), { hours: 1 });

    return user;
  }

  updatePasswordRecoveryCode(user: UserDocument): UserDocument {
    user.passwordRecoveryCode = uuidv4();

    return user;
  }

  updatePassword(user: UserDocument, hash, code): UserDocument {
    user.passwordHash = hash;
    user.passwordRecoveryCode = code;

    return user;
  }

  static async createUserEntity(
    createUserDto: CreateUserDto,
    passwordHash: string,
    isConfirmed = false,
    UserModel: UserModelType,
  ): Promise<UserDocument> {
    const { login, email, password } = createUserDto;
    const existingUserWithLogin = await UserModel.findOne({ login });
    const existingUserWithEmail = await UserModel.findOne({ email });

    if (existingUserWithLogin) generateExistingFieldError('user', 'login');
    if (existingUserWithEmail) generateExistingFieldError('user', 'email');

    const emailConfirmation: EmailConfirmation = {
      confirmationCode: uuidv4(),
      expirationDate: add(new Date(), { hours: 1 }),
      isConfirmed,
    };

    return new UserModel({
      login,
      email,
      password,
      passwordHash,
      isConfirmed,
      emailConfirmation,
    });
  }
}

export type UserDocument = HydratedDocument<User>;

export interface IUsersStaticMethods {
  createUserEntity(
    createUserDto: CreateUserDto,
    hash: string,
    isConfirmed: boolean,
    UserModel: UserModelType,
  ): Promise<UserDocument>;
}

export type UserModelType = Model<User> & IUsersStaticMethods;

export const userSchema = SchemaFactory.createForClass(User);

userSchema.static('createUserEntity', User.createUserEntity);

userSchema.methods = {
  confirmUserRegistration: User.prototype.confirmUserRegistration,
  updateConfirmationCode: User.prototype.updateConfirmationCode,
  updatePasswordRecoveryCode: User.prototype.updatePasswordRecoveryCode,
  updatePassword: User.prototype.updatePassword,
};
