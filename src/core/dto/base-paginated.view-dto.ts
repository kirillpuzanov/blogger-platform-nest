export abstract class PaginatedViewDto<T> {
  abstract items: T;
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;

  static mapToView<T>(data: {
    items: T;
    page: number;
    size: number;
    totalCount: number;
  }): PaginatedViewDto<T> {
    return {
      totalCount: data.totalCount,
      items: data.items,
      page: data.page,
      pageSize: data.size,
      pagesCount: Math.ceil(data.totalCount / data.size),
    };
  }
}

export const sortDirectionAdapter: Record<'asc' | 'desc', 'ASC' | 'DESC'> = {
  asc: 'ASC',
  desc: 'DESC',
};
