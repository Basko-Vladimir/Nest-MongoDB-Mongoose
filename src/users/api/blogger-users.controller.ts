import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AuthGuard } from '../../common/guards/auth.guard';
import { UpdateUserBanStatusForBlogDto } from './dto/update-user-ban-status-for-blog.dto';
import { UpdateUserBanStatusForBlogCommand } from '../application/use-cases/update-user-ban-status-for-blog.useCase';
import { AllBannedUsersForSpecificBlogOutputModel } from './dto/banned-users-for-specific-blog-output-model.dto';
import { BannedUsersForSpecificBlogQueryParamsDto } from './dto/banned-users-for-specific-blog-query-params.dto';
import { QueryBloggerUsersRepositoryService } from '../infrastructure/query-blogger-users-repository.service';
import { UserDocument } from '../schemas/user.schema';
import { User } from '../../common/decorators/user.decorator';
import { ActionsOnBlogGuard } from '../../common/guards/actions-on-blog.guard';

@Controller('blogger/users')
export class BloggerUsersController {
  constructor(
    private commandBus: CommandBus,
    private queryBloggerUsersRepositoryService: QueryBloggerUsersRepositoryService,
  ) {}

  @Get('blog/:id')
  @UseGuards(AuthGuard, ActionsOnBlogGuard)
  async findBannedUsersForSpecificBlog(
    @Param('id') blogId: string,
    @Query() queryParams: BannedUsersForSpecificBlogQueryParamsDto,
  ): Promise<AllBannedUsersForSpecificBlogOutputModel> {
    return this.queryBloggerUsersRepositoryService.findAllBannedUsersForSpecificBlog(
      blogId,
      queryParams,
    );
  }

  @Put(':id/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async updateUserBanStatusForBlog(
    @Param('id') blockedUserId: string,
    @Body() updateUserBanStatusForBlogDto: UpdateUserBanStatusForBlogDto,
    @User() user: UserDocument,
  ): Promise<void> {
    return this.commandBus.execute(
      new UpdateUserBanStatusForBlogCommand(
        blockedUserId,
        updateUserBanStatusForBlogDto,
        user,
      ),
    );
  }
}
