export type PaginatedAsyncResult<R, A, E> =
  | { readonly type: "loading-previous" }
  | { readonly type: "loading" }
  | { readonly type: "loading-next" }
  | { readonly type: "error"; readonly error: E }
  | {
      readonly type: "success";
      readonly data: Array<{ readonly page: A; readonly params: R }>;
    };
