import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { clearAuth, tokensRefreshed, type AuthState } from "./authSlice";
import type {
  AuthResponse,
  AuthorProfile,
  Book,
  BookInput,
  BookQuery,
  BookStatus,
  BorrowRecord,
  BorrowStatus,
  Category,
  FavoriteItem,
  Page,
  Review,
  Role,
  User,
  UserQuery,
  UserStatus,
} from "../types";

const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

function clean(params?: object) {
  if (!params) return undefined;
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as { auth: AuthState }).auth.accessToken;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

const publicAuth = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/logout",
  "/auth/forgot-password",
  "/auth/reset-password",
];

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extra,
) => {
  let result = await rawBaseQuery(args, api, extra);
  const url = typeof args === "string" ? args : args.url;
  if (result.error?.status !== 401 || publicAuth.some((path) => url.startsWith(path))) {
    return result;
  }

  const refreshToken = (api.getState() as { auth: AuthState }).auth.refreshToken;
  if (!refreshToken) {
    api.dispatch(clearAuth());
    return result;
  }

  const refresh = await rawBaseQuery(
    { url: "/auth/refresh", method: "POST", body: { refreshToken } },
    api,
    extra,
  );

  const data = refresh.data as { accessToken?: string; refreshToken?: string } | undefined;
  if (data?.accessToken && data.refreshToken) {
    api.dispatch(tokensRefreshed({ accessToken: data.accessToken, refreshToken: data.refreshToken }));
    result = await rawBaseQuery(args, api, extra);
  } else {
    api.dispatch(clearAuth());
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Book", "Category", "Review", "Favorite", "Borrow", "User", "Author", "Me"],
  refetchOnMountOrArgChange: 30,
  endpoints: (build) => ({
    register: build.mutation<
      { message: string; user: User },
      { name: string; email: string; password: string; role?: "USER" | "AUTHOR"; penName?: string; bio?: string; website?: string }
    >({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
    }),
    login: build.mutation<AuthResponse, { email: string; password: string }>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
    logout: build.mutation<{ message: string }, { refreshToken: string }>({
      query: (body) => ({ url: "/auth/logout", method: "POST", body }),
    }),
    me: build.query<User, void>({
      query: () => "/auth/me",
      providesTags: ["Me"],
    }),
    forgotPassword: build.mutation<{ message: string }, { email: string }>({
      query: (body) => ({ url: "/auth/forgot-password", method: "POST", body }),
    }),
    resetPassword: build.mutation<{ message: string }, { token: string; newPassword: string }>({
      query: (body) => ({ url: "/auth/reset-password", method: "POST", body }),
    }),

    health: build.query<{ status: string; database: string }, void>({
      query: () => "/health",
    }),

    categories: build.query<Category[], void>({
      query: () => "/categories",
      providesTags: ["Category"],
    }),
    category: build.query<Category, string>({
      query: (idOrSlug) => `/categories/${idOrSlug}`,
      providesTags: ["Category"],
    }),
    createCategory: build.mutation<Category, { name: string; description?: string }>({
      query: (body) => ({ url: "/categories", method: "POST", body }),
      invalidatesTags: ["Category"],
    }),
    updateCategory: build.mutation<Category, { id: string; name?: string; description?: string }>({
      query: ({ id, ...body }) => ({ url: `/categories/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Category"],
    }),
    deleteCategory: build.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/categories/${id}`, method: "DELETE" }),
      invalidatesTags: ["Category"],
    }),

    books: build.query<Page<Book>, BookQuery | void>({
      query: (params) => ({ url: "/books", params: clean(params ?? undefined) }),
      providesTags: ["Book"],
    }),
    book: build.query<Book, string>({
      query: (idOrSlug) => `/books/${idOrSlug}`,
      providesTags: ["Book"],
    }),
    myBooks: build.query<Page<Book>, BookQuery | void>({
      query: (params) => ({ url: "/books/author/my-books", params: clean(params ?? undefined) }),
      providesTags: ["Book"],
    }),
    adminBooks: build.query<Page<Book>, BookQuery | void>({
      query: (params) => ({ url: "/books/admin/all", params: clean(params ?? undefined) }),
      providesTags: ["Book"],
    }),
    createBook: build.mutation<Book, BookInput>({
      query: (body) => ({ url: "/books", method: "POST", body }),
      invalidatesTags: ["Book"],
    }),
    updateBook: build.mutation<Book, { id: string } & Partial<BookInput>>({
      query: ({ id, ...body }) => ({ url: `/books/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Book"],
    }),
    updateBookStatus: build.mutation<Book, { id: string; status: BookStatus }>({
      query: ({ id, status }) => ({ url: `/books/${id}/status`, method: "PATCH", body: { status } }),
      invalidatesTags: ["Book"],
    }),
    deleteBook: build.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/books/${id}`, method: "DELETE" }),
      invalidatesTags: ["Book"],
    }),

    requestBorrow: build.mutation<{ message: string; data: BorrowRecord }, { bookId: string; dueDate?: string }>({
      query: ({ bookId, dueDate }) => ({
        url: `/borrow/${bookId}`,
        method: "POST",
        body: dueDate ? { dueDate } : {},
      }),
      invalidatesTags: ["Borrow", "Book"],
    }),
    myBorrows: build.query<BorrowRecord[], void>({
      query: () => "/borrow/my-records",
      providesTags: ["Borrow"],
    }),
    adminBorrows: build.query<BorrowRecord[], BorrowStatus | void>({
      query: (status) => ({ url: "/borrow/admin/all", params: status ? { status } : undefined }),
      providesTags: ["Borrow"],
    }),
    updateBorrowStatus: build.mutation<BorrowRecord, { id: string; status: BorrowStatus }>({
      query: ({ id, status }) => ({ url: `/borrow/${id}/status`, method: "PATCH", body: { status } }),
      invalidatesTags: ["Borrow", "Book"],
    }),
    cancelBorrow: build.mutation<{ message: string; data: BorrowRecord }, string>({
      query: (id) => ({ url: `/borrow/${id}/cancel`, method: "POST" }),
      invalidatesTags: ["Borrow"],
    }),
    requestReturn: build.mutation<{ message: string; data: BorrowRecord }, string>({
      query: (id) => ({ url: `/borrow/${id}/return-request`, method: "POST" }),
      invalidatesTags: ["Borrow"],
    }),

    bookReviews: build.query<Review[], string>({
      query: (bookId) => `/reviews/book/${bookId}`,
      providesTags: ["Review"],
    }),
    saveReview: build.mutation<{ message: string; data: Review }, { bookId: string; rating: number; comment?: string }>({
      query: ({ bookId, ...body }) => ({ url: `/reviews/book/${bookId}`, method: "POST", body }),
      invalidatesTags: ["Review", "Book"],
    }),
    deleteReview: build.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/reviews/${id}`, method: "DELETE" }),
      invalidatesTags: ["Review", "Book"],
    }),

    favorites: build.query<FavoriteItem[], void>({
      query: () => "/favorites",
      providesTags: ["Favorite"],
    }),
    toggleFavorite: build.mutation<{ isFavorited: boolean; message: string }, string>({
      query: (bookId) => ({ url: `/favorites/${bookId}`, method: "POST" }),
      invalidatesTags: ["Favorite"],
    }),
    favoriteCheck: build.query<{ isFavorited: boolean }, string>({
      query: (bookId) => `/favorites/check/${bookId}`,
      providesTags: ["Favorite"],
    }),

    updateProfile: build.mutation<{ message: string; data: User }, { name?: string; avatar?: string }>({
      query: (body) => ({ url: "/users/me", method: "PATCH", body }),
      invalidatesTags: ["Me", "User"],
    }),
    users: build.query<Page<User>, UserQuery | void>({
      query: (params) => ({ url: "/users", params: clean(params ?? undefined) }),
      providesTags: ["User"],
    }),
    user: build.query<User, string>({
      query: (id) => `/users/${id}`,
      providesTags: ["User"],
    }),
    updateUserStatus: build.mutation<{ message: string; data: User }, { id: string; status: UserStatus }>({
      query: ({ id, status }) => ({ url: `/users/${id}/status`, method: "PATCH", body: { status } }),
      invalidatesTags: ["User"],
    }),
    updateUserRole: build.mutation<{ message: string; data: User }, { id: string; role: Role }>({
      query: ({ id, role }) => ({ url: `/users/${id}/role`, method: "PATCH", body: { role } }),
      invalidatesTags: ["User", "Author"],
    }),

    myAuthor: build.query<AuthorProfile, void>({
      query: () => "/authors/me",
      providesTags: ["Author"],
    }),
    updateAuthor: build.mutation<
      AuthorProfile,
      { penName?: string; bio?: string; website?: string; socialLinks?: Record<string, string> }
    >({
      query: (body) => ({ url: "/authors/me", method: "PATCH", body }),
      invalidatesTags: ["Author", "Me"],
    }),
    publicAuthor: build.query<AuthorProfile, string>({
      query: (id) => `/authors/${id}`,
      providesTags: ["Author"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useMeQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useHealthQuery,
  useCategoriesQuery,
  useCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useBooksQuery,
  useBookQuery,
  useMyBooksQuery,
  useAdminBooksQuery,
  useCreateBookMutation,
  useUpdateBookMutation,
  useUpdateBookStatusMutation,
  useDeleteBookMutation,
  useRequestBorrowMutation,
  useMyBorrowsQuery,
  useAdminBorrowsQuery,
  useUpdateBorrowStatusMutation,
  useCancelBorrowMutation,
  useRequestReturnMutation,
  useBookReviewsQuery,
  useSaveReviewMutation,
  useDeleteReviewMutation,
  useFavoritesQuery,
  useToggleFavoriteMutation,
  useFavoriteCheckQuery,
  useUpdateProfileMutation,
  useUsersQuery,
  useUserQuery,
  useUpdateUserStatusMutation,
  useUpdateUserRoleMutation,
  useMyAuthorQuery,
  useUpdateAuthorMutation,
  usePublicAuthorQuery,
} = api;
