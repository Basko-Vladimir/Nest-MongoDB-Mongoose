import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogsQueryParamsDto } from '../api/dto/blogs-query-params.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument, BlogModelType } from '../schemas/blog.schema';
import { BlogSortByField, SortDirection } from '../../common/enums';
import { countSkipValue, setSortValue } from '../../common/utils';
import {
  AllBlogsOutputModel,
  IBlogOutputModel,
} from '../api/dto/blogs-output-models.dto';
import { mapDbBlogToBlogOutputModel } from '../mappers/blogs-mappers';
import { UpdateOrFilterModel } from '../../common/types';

interface IBlogsDataByQueryParams {
  blogs: BlogDocument[];
  totalCount: number;
  pageSize: number;
  pageNumber: number;
}

interface BlogsDataFilter {
  queryParams: BlogsQueryParamsDto;
  userId?: string;
  additionalFilter?: UpdateOrFilterModel;
}

@Injectable()
export class QueryBlogsRepository {
  constructor(@InjectModel(Blog.name) protected BlogModel: BlogModelType) {}

  async findAllBlogs(
    queryParams: BlogsQueryParamsDto,
  ): Promise<AllBlogsOutputModel> {
    const { blogs, totalCount, pageNumber, pageSize } =
      await this.getBlogsDataByQueryParams({
        queryParams,
        additionalFilter: { ['banInfo.isBanned']: false },
      });

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: Number(pageNumber),
      pageSize: Number(pageSize),
      totalCount,
      items: blogs.map(mapDbBlogToBlogOutputModel),
    };
  }

  async findBlogById(blogId): Promise<IBlogOutputModel> {
    const targetBlog = await this.BlogModel.findById(blogId);

    if (!targetBlog || targetBlog.banInfo.isBanned) {
      throw new NotFoundException();
    }

    return mapDbBlogToBlogOutputModel(targetBlog);
  }

  protected async getBlogsDataByQueryParams(
    blogsDataFilter: BlogsDataFilter,
  ): Promise<IBlogsDataByQueryParams> {
    const { queryParams, additionalFilter, userId } = blogsDataFilter;
    const {
      sortBy = BlogSortByField.createdAt,
      sortDirection = SortDirection.desc,
      pageNumber = 1,
      pageSize = 10,
      searchNameTerm = '',
    } = queryParams;
    const skip = countSkipValue(pageNumber, pageSize);
    const sortSetting = setSortValue(sortBy, sortDirection);
    let filter: UpdateOrFilterModel = {};

    if (additionalFilter) {
      filter = { ...additionalFilter };
    }
    if (searchNameTerm) {
      filter.name = new RegExp(searchNameTerm, 'i');
    }
    if (userId) {
      filter['blogOwnerInfo.ownerId'] = userId;
    }

    const totalCount = await this.BlogModel.countDocuments(filter);
    const blogs = await this.BlogModel.find(filter)
      .skip(skip)
      .limit(pageSize)
      .sort(sortSetting);

    return { blogs, totalCount, pageNumber, pageSize };
  }
}
