import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsQueryParamsDto } from './dto/posts-query-params.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { IFullPostOutputModel } from './dto/posts-output-models.dto';
import {
  getFullPostOutputModel,
  mapDbPostToPostOutputModel,
} from './mappers/posts-mapper';
import { LikesService } from '../likes/likes.service';
import { BlogAllFullPostsOutputModel } from '../blogs/dto/blogs-output-models.dto';
import { CommentsService } from '../comments/comments.service';
import { CommentsQueryParamsDto } from '../comments/dto/comments-query-params.dto';
import { AllCommentsOutputModel } from '../comments/dto/comments-output-models.dto';
import { getFullCommentOutputModel } from '../comments/mappers/comments-mapper';
import { ParseObjectIdPipe } from '../pipes/parse-object-id.pipe';
import { AuthGuard } from '../guards/auth.guard';

@Controller('posts')
export class PostsController {
  constructor(
    protected postsService: PostsService,
    protected likesService: LikesService,
    protected commentsService: CommentsService,
  ) {}

  @Get()
  async findPosts(
    @Query() queryParams: PostsQueryParamsDto,
  ): Promise<BlogAllFullPostsOutputModel> {
    const postsOutputModel = await this.postsService.findPosts(queryParams);
    const posts = postsOutputModel.items;
    const fullPosts = [];

    for (let i = 0; i < posts.length; i++) {
      fullPosts.push(await getFullPostOutputModel(posts[i], this.likesService));
    }

    return {
      ...postsOutputModel,
      items: fullPosts,
    };
  }

  @Get(':id/comments')
  async getCommentsForPost(
    @Param('id', ParseObjectIdPipe) postId: string,
    @Query() queryParams: CommentsQueryParamsDto,
  ): Promise<AllCommentsOutputModel> {
    const targetPost = await this.postsService.findPostById(postId);

    if (!targetPost) throw new NotFoundException();

    const commentsOutputModel = await this.commentsService.findComments(
      queryParams,
      postId,
    );
    const comments = commentsOutputModel.items;
    const fullComments = [];

    for (let i = 0; i < comments.length; i++) {
      fullComments.push(
        await getFullCommentOutputModel(comments[i], this.likesService),
      );
    }

    return {
      ...commentsOutputModel,
      items: fullComments,
    };
  }

  @Get(':id')
  async findPostById(
    @Param('id', ParseObjectIdPipe) postId: string,
  ): Promise<IFullPostOutputModel> {
    const targetPost = await this.postsService.findPostById(postId);
    const postOutputModel = mapDbPostToPostOutputModel(targetPost);
    return getFullPostOutputModel(postOutputModel, this.likesService);
  }

  @Post()
  @UseGuards(AuthGuard)
  async createPost(@Body() body: CreatePostDto): Promise<IFullPostOutputModel> {
    const createdPost = await this.postsService.createPost(body);
    const postOutputModel = mapDbPostToPostOutputModel(createdPost);
    return getFullPostOutputModel(postOutputModel, this.likesService);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(AuthGuard)
  async deletePost(
    @Param('id', ParseObjectIdPipe) postId: string,
  ): Promise<void> {
    return this.postsService.deletePost(postId);
  }

  @Put(':id')
  @HttpCode(204)
  @UseGuards(AuthGuard)
  async updatePost(
    @Param('id', ParseObjectIdPipe) postId: string,
    @Body() body: UpdatePostDto,
  ): Promise<void> {
    return this.postsService.updatePost(postId, body);
  }
}
