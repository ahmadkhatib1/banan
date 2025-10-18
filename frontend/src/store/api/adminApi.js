import { apiSlice } from './apiSlice';
import { API_ENDPOINTS } from '../../utils/apiConfig';

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminDashboard: builder.query({
      query: () => API_ENDPOINTS.ADMIN.DASHBOARD,
      providesTags: ['Admin'],
    }),

    getAdminUsers: builder.query({
      query: (params) => ({
        url: API_ENDPOINTS.ADMIN.USERS,
        params,
      }),
      providesTags: ['Admin', 'User'],
    }),

    getAdminCourses: builder.query({
      query: (params) => ({
        url: API_ENDPOINTS.ADMIN.COURSES,
        params,
      }),
      providesTags: ['Admin', 'Course'],
    }),

    getAdminStatistics: builder.query({
      query: (params) => ({
        url: API_ENDPOINTS.ADMIN.STATISTICS,
        params,
      }),
      providesTags: ['Admin'],
    }),

    getSystemHealth: builder.query({
      query: () => '/admin/system/health',
      providesTags: ['Admin'],
    }),

    getSystemLogs: builder.query({
      query: (params) => ({
        url: '/admin/system/logs',
        params,
      }),
      providesTags: ['Admin'],
    }),

    getReportsOverview: builder.query({
      query: (params) => ({
        url: '/admin/reports/overview',
        params,
      }),
      providesTags: ['Admin'],
    }),

    getUserReports: builder.query({
      query: (params) => ({
        url: '/admin/reports/users',
        params,
      }),
      providesTags: ['Admin', 'User'],
    }),

    getCourseReports: builder.query({
      query: (params) => ({
        url: '/admin/reports/courses',
        params,
      }),
      providesTags: ['Admin', 'Course'],
    }),

    getRevenueReports: builder.query({
      query: (params) => ({
        url: '/admin/reports/revenue',
        params,
      }),
      providesTags: ['Admin'],
    }),

    getEngagementReports: builder.query({
      query: (params) => ({
        url: '/admin/reports/engagement',
        params,
      }),
      providesTags: ['Admin'],
    }),

    suspendUser: builder.mutation({
      query: ({ userId, reason }) => ({
        url: `/admin/users/${userId}/suspend`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['Admin', 'User'],
    }),

    unsuspendUser: builder.mutation({
      query: (userId) => ({
        url: `/admin/users/${userId}/unsuspend`,
        method: 'POST',
      }),
      invalidatesTags: ['Admin', 'User'],
    }),

    approveCourse: builder.mutation({
      query: (courseId) => ({
        url: `/admin/courses/${courseId}/approve`,
        method: 'POST',
      }),
      invalidatesTags: ['Admin', 'Course'],
    }),

    rejectCourse: builder.mutation({
      query: ({ courseId, reason }) => ({
        url: `/admin/courses/${courseId}/reject`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['Admin', 'Course'],
    }),

    updateSystemSettings: builder.mutation({
      query: (settings) => ({
        url: '/admin/settings',
        method: 'PUT',
        body: settings,
      }),
      invalidatesTags: ['Admin'],
    }),

    getSystemSettings: builder.query({
      query: () => '/admin/settings',
      providesTags: ['Admin'],
    }),

    createAnnouncement: builder.mutation({
      query: (announcement) => ({
        url: '/admin/announcements',
        method: 'POST',
        body: announcement,
      }),
      invalidatesTags: ['Admin'],
    }),

    getAnnouncements: builder.query({
      query: (params) => ({
        url: '/admin/announcements',
        params,
      }),
      providesTags: ['Admin'],
    }),

    deleteAnnouncement: builder.mutation({
      query: (id) => ({
        url: `/admin/announcements/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Admin'],
    }),

    exportData: builder.mutation({
      query: (exportOptions) => ({
        url: '/admin/export',
        method: 'POST',
        body: exportOptions,
      }),
    }),

    importData: builder.mutation({
      query: (importData) => ({
        url: '/admin/import',
        method: 'POST',
        body: importData,
      }),
      invalidatesTags: ['Admin', 'User', 'Course'],
    }),

    getDatabaseBackups: builder.query({
      query: () => '/admin/backups',
      providesTags: ['Admin'],
    }),

    createBackup: builder.mutation({
      query: () => ({
        url: '/admin/backups',
        method: 'POST',
      }),
      invalidatesTags: ['Admin'],
    }),

    restoreBackup: builder.mutation({
      query: (backupId) => ({
        url: `/admin/backups/${backupId}/restore`,
        method: 'POST',
      }),
      invalidatesTags: ['Admin'],
    }),

    getAuditLogs: builder.query({
      query: (params) => ({
        url: '/admin/audit-logs',
        params,
      }),
      providesTags: ['Admin'],
    }),

    clearCache: builder.mutation({
      query: () => ({
        url: '/admin/cache/clear',
        method: 'POST',
      }),
      invalidatesTags: ['Admin'],
    }),
  }),
});

export const {
  useGetAdminDashboardQuery,
  useGetAdminUsersQuery,
  useGetAdminCoursesQuery,
  useGetAdminStatisticsQuery,
  useGetSystemHealthQuery,
  useGetSystemLogsQuery,
  useGetReportsOverviewQuery,
  useGetUserReportsQuery,
  useGetCourseReportsQuery,
  useGetRevenueReportsQuery,
  useGetEngagementReportsQuery,
  useSuspendUserMutation,
  useUnsuspendUserMutation,
  useApproveCourseMutation,
  useRejectCourseMutation,
  useUpdateSystemSettingsMutation,
  useGetSystemSettingsQuery,
  useCreateAnnouncementMutation,
  useGetAnnouncementsQuery,
  useDeleteAnnouncementMutation,
  useExportDataMutation,
  useImportDataMutation,
  useGetDatabaseBackupsQuery,
  useCreateBackupMutation,
  useRestoreBackupMutation,
  useGetAuditLogsQuery,
  useClearCacheMutation,
} = adminApi;
