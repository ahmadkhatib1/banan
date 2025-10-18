import { apiSlice } from './apiSlice';
import { API_ENDPOINTS } from '../../utils/apiConfig';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: API_ENDPOINTS.AUTH.LOGIN,
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),

    register: builder.mutation({
      query: (userData) => ({
        url: API_ENDPOINTS.AUTH.REGISTER,
        method: 'POST',
        body: userData,
      }),
    }),

    logout: builder.mutation({
      query: () => ({
        url: API_ENDPOINTS.AUTH.LOGOUT,
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),

    getProfile: builder.query({
      query: () => API_ENDPOINTS.AUTH.PROFILE,
      providesTags: ['Auth'],
    }),

    updateProfile: builder.mutation({
      query: (userData) => ({
        url: API_ENDPOINTS.AUTH.PROFILE,
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: ['Auth'],
    }),

    changePassword: builder.mutation({
      query: (passwordData) => ({
        url: API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
        method: 'PUT',
        body: passwordData,
      }),
    }),

    forgotPassword: builder.mutation({
      query: (email) => ({
        url: API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
        method: 'POST',
        body: { email },
      }),
    }),

    resetPassword: builder.mutation({
      query: (resetData) => ({
        url: API_ENDPOINTS.AUTH.RESET_PASSWORD,
        method: 'POST',
        body: resetData,
      }),
    }),

    getMe: builder.query({
      query: () => API_ENDPOINTS.AUTH.ME,
      providesTags: ['Auth'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetMeQuery,
} = authApi;
