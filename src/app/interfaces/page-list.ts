export interface PageList<T> {
    items: T[];
    _links: { self: { href: string } };
    _meta: PageProperty;
}

export interface PageProperty {
    totalCount: number;
    pageCount: number;
    currentPage: number;
    perPage: number;
}
