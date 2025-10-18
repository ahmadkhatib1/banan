import { apiSlice } from './apiSlice';
import { API_ENDPOINTS } from '../../utils/apiConfig';

export const usersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: (params) => ({
        url: API_ENDPOINTS.USERS.BASE,
        params,
      }),
      providesTags: ['User'],
    }),

    getUserById: builder.query({
      query: (id) => API_ENDPOINTS.USERS.BY_ID(id),
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    searchUsers: builder.query({
      query: (searchTerm) => ({
        url: API_ENDPOINTS.USERS.SEARCH,
        params: { q: searchTerm },
      }),
      providesTags: ['User'],
    }),

    getUserStatistics: builder.query({
      query: () => API_ENDPOINTS.USERS.STATISTICS,
      providesTags: ['User'],
    }),

    updateUser: builder.mutation({
      query: ({ id, ...userData }) => ({
        url: API_ENDPOINTS.USERS.BY_ID(id),
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }, 'Auth'],
    }),

    deleteUser: builder.mutation({
      query: (id) => ({
        url: API_ENDPOINTS.USERS.BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    changeUserStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `${API_ENDPOINTS.USERS.BY_ID(id)}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
    }),

    changeUserRole: builder.mutation({
      query: ({ id, role }) => ({
        url: `${API_ENDPOINTS.USERS.BY_ID(id)}/role`,
        method: 'PUT',
        body: { role },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
    }),

    getUserDashboard: builder.query({
      query: (id) => API_ENDPOINTS.USERS.DASHBOARD(id),
      providesTags: (result, error, id) => [
        { type: 'User', id },
        'Course',
        'Progress',
      ],
    }),

    getUserCourses: builder.query({
      query: (id) => API_ENDPOINTS.USERS.COURSES(id),
      providesTags: (result, error, id) => [
        { type: 'User', id },
        'Course',
      ],
    }),

    getUserProgress: builder.query({
      query: (id) => API_ENDPOINTS.USERS.PROGRESS(id),
      providesTags: (result, error, id) => [
        { type: 'User', id },
        'Progress',
      ],
    }),

    verifyUserEmail: builder.mutation({
      query: (id) => ({
        url: `${API_ENDPOINTS.USERS.BY_ID(id)}/verify-email`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    bulkUserAction: builder.mutation({
      query: (actionData) => ({
        url: '/users/bulk-action',
        method: 'POST',
        body: actionData,
      }),
      invalidatesTags: ['User'],
    }),

    createUser: builder.mutation({
      query: (userData) => ({
        url: API_ENDPOINTS.USERS.BASE,
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),

    getUsersByRole: builder.query({
      query: (role) => ({
        url: API_ENDPOINTS.USERS.BASE,
        params: { role },
      }),
      providesTags: ['User'],
    }),

    getUserActivity: builder.query({
      query: (id) => `${API_ENDPOINTS.USERS.BY_ID(id)}/activity`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    getUserAchievements: builder.query({
      query: (id) => `${API_ENDPOINTS.USERS.BY_ID(id)}/achievements`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    getUserCertificates: builder.query({
      query: (id) => `${API_ENDPOINTS.USERS.BY_ID(id)}/certificates`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    updateUserPreferences: builder.mutation({
      query: ({ id, preferences }) => ({
        url: `${API_ENDPOINTS.USERS.BY_ID(id)}/preferences`,
        method: 'PUT',
        body: { preferences },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
    }),

    uploadUserAvatar: builder.mutation({
      query: ({ id, avatar }) => ({
        url: `${API_ENDPOINTS.USERS.BY_ID(id)}/avatar`,
        method: 'POST',
        body: avatar,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }, 'Auth'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useSearchUsersQuery,
  useGetUserStatisticsQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useChangeUserStatusMutation,
  useChangeUserRoleMutation,
  useGetUserDashboardQuery,
  useGetUserCoursesQuery,
  useGetUserProgressQuery,
  useVerifyUserEmailMutation,
  useBulkUserActionMutation,
  useCreateUserMutation,
  useGetUsersByRoleQuery,
  useGetUserActivityQuery,
  useGetUserAchievementsQuery,
  useGetUserCertificatesQuery,
  useUpdateUserPreferencesMutation,
  useUploadUserAvatarMutation,
} = usersApi;
