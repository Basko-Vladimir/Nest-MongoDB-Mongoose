import { SortDirection, UserSortByField } from '../../common/enums';

export class UserQueryParamsDto {
  sortBy: UserSortByField;
  sortDirection: SortDirection;
  pageNumber: number;
  pageSize: number;
  searchLoginTerm: string;
  searchEmailTerm: string;
}
