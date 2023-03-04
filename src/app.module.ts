import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User, userSchema } from './users/schemas/user.schema';
import { Blog, blogSchema } from './blogs/schemas/blog.schema';
import { Post, postSchema } from './posts/schemas/post.schema';
import { Like, likeSchema } from './likes/schemas/like.schema';
import { Comment, commentSchema } from './comments/schemas/comment.schema';
import { BlogsController } from './blogs/api/blogs.controller';
import { PostsController } from './posts/posts.controller';
import { UsersController } from './users/api/users.controller';
import { UsersService } from './users/application/users.service';
import { BlogsService } from './blogs/application/blogs.service';
import { PostsService } from './posts/posts.service';
import { LikesService } from './likes/likes.service';
import { UsersRepository } from './users/infrastructure/users.repository';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';
import { PostsRepository } from './posts/posts.repository';
import { LikesRepository } from './likes/likes.repository';
import { CommentsController } from './comments/comments.controller';
import { CommentsService } from './comments/comments.service';
import { CommentsRepository } from './comments/comments.repository';
import { JwtService } from './auth/infrastructure/jwt.service';
import { AuthService } from './auth/application/auth.service';
import { AuthController } from './auth/api/auth.controller';
import { EmailManager } from './common/managers/email.manager';
import { EmailAdapter } from './common/adapters/email.adapter';
import { IsExistEntityValidator } from './common/validators/is-exist-entity.validator';
import { DevicesSessionsController } from './devices-sessions/devices-sessions.controller';
import { DevicesSessionsService } from './devices-sessions/devices-sessions.service';
import { DevicesSessionsRepository } from './devices-sessions/devices-sessions.repository';
import {
  DeviceSession,
  deviceSessionSchema,
} from './devices-sessions/schemas/device-session.schema';
import { ClientsRequestsRepository } from './clients-requests/clients-requests.repository';
import { ClientsRequestsService } from './clients-requests/clients-requests.service';
import {
  ClientRequest,
  clientRequestSchema,
} from './clients-requests/schemas/client-request.schema';
import { CreateBlogUseCase } from './blogs/application/use-cases/create-blog.useCase';
import { DeleteBlogUseCase } from './blogs/application/use-cases/delete-blog.useCase';
import { UpdateBlogUseCase } from './blogs/application/use-cases/update-blog.useCase';
import { QueryBlogsRepository } from './blogs/infrastructure/query-blogs.repository';
import { RegisterUserUseCase } from './auth/application/use-cases/register-user.useCase';
import { ResendRegistrationEmailUseCase } from './auth/application/use-cases/resend-registration-email.useCase';
import { LoginUserUseCase } from './auth/application/use-cases/login-user.useCase';
import { RecoverPasswordUseCase } from './auth/application/use-cases/recover-password.useCase';
import { ChangePasswordUseCase } from './auth/application/use-cases/change-password.useCase';
import { RefreshTokensUseCase } from './auth/application/use-cases/refresh-tokens.useCase';
import { LogoutUseCase } from './auth/application/use-cases/logout.useCase';

const useCases = [
  CreateBlogUseCase,
  DeleteBlogUseCase,
  UpdateBlogUseCase,
  RegisterUserUseCase,
  ResendRegistrationEmailUseCase,
  LoginUserUseCase,
  RecoverPasswordUseCase,
  ChangePasswordUseCase,
  RefreshTokensUseCase,
  LogoutUseCase,
];

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME,
    }),
    MongooseModule.forFeature([{ name: User.name, schema: userSchema }]),
    MongooseModule.forFeature([{ name: Blog.name, schema: blogSchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: postSchema }]),
    MongooseModule.forFeature([{ name: Like.name, schema: likeSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: commentSchema }]),
    MongooseModule.forFeature([
      { name: DeviceSession.name, schema: deviceSessionSchema },
    ]),
    MongooseModule.forFeature([
      { name: ClientRequest.name, schema: clientRequestSchema },
    ]),
    CqrsModule,
  ],
  controllers: [
    AppController,
    UsersController,
    BlogsController,
    PostsController,
    CommentsController,
    AuthController,
    DevicesSessionsController,
  ],
  providers: [
    AppService,
    UsersService,
    UsersRepository,
    BlogsService,
    BlogsRepository,
    QueryBlogsRepository,
    PostsService,
    PostsRepository,
    LikesService,
    LikesRepository,
    CommentsService,
    CommentsRepository,
    AuthService,
    JwtService,
    DevicesSessionsService,
    DevicesSessionsRepository,
    ClientsRequestsService,
    ClientsRequestsRepository,
    EmailManager,
    EmailAdapter,
    IsExistEntityValidator,
    ...useCases,
  ],
})
export class AppModule {}
