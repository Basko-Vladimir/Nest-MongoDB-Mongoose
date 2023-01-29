import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from './schemas/user.schema';
import { countSkipValue, getFilterByDbId, setSortValue } from '../common/utils';
import { UserQueryParamsDto } from './dto/user-query-params.dto';
import { mapDbUserToUserOutputModel } from './mappers/users-mappers';
import { AllUsersOutputModel } from './dto/users-models.dto';
import { SortDirection, UserSortByField } from '../common/enums';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async findAllUsers(
    queryParams: UserQueryParamsDto,
  ): Promise<AllUsersOutputModel> {
    const {
      sortBy = UserSortByField.createdAt,
      sortDirection = SortDirection.desc,
      pageNumber = 1,
      pageSize = 10,
      searchEmailTerm = '',
      searchLoginTerm = '',
    } = queryParams;
    const skip = countSkipValue(pageNumber, pageSize);
    const sortSetting = setSortValue(sortBy, sortDirection);

    const totalCount = await this.UserModel.countDocuments()
      .where('email', new RegExp(searchEmailTerm, 'i'))
      .where('login', new RegExp(searchLoginTerm, 'i'));
    const users = await this.UserModel.find()
      .where('email', new RegExp(searchEmailTerm, 'i'))
      .where('login', new RegExp(searchLoginTerm, 'i'))
      .skip(skip)
      .limit(pageSize)
      .sort(sortSetting);

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount,
      items: users.map(mapDbUserToUserOutputModel),
    };
  }

  async saveUser(user: UserDocument): Promise<UserDocument> {
    return user.save();
  }

  async deleteUser(userId: string): Promise<void> {
    const { deletedCount } = await this.UserModel.deleteOne(
      getFilterByDbId(userId),
    );

    if (!deletedCount) throw new NotFoundException();
  }
}
