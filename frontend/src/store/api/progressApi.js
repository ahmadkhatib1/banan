import { apiSlice } from './apiSlice';
import { API_ENDPOINTS } from '../../utils/apiConfig';

export const progressApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserProgress: builder.query({
      query: () => API_ENDPOINTS.PROGRESS.BASE,
      providesTags: ['Progress'],
    }),

    updateProgress: builder.mutation({
      query: (progressData) => ({
        url: API_ENDPOINTS.PROGRESS.BASE,
        method: 'POST',
        body: progressData,
      }),
      invalidatesTags: ['Progress'],
    }),

    completeLesson: builder.mutation({
      query: (lessonId) => ({
        url: API_ENDPOINTS.PROGRESS.COMPLETE,
        method: 'POST',
        body: { lessonId },
      }),
      invalidatesTags: ['Progress', 'Lesson', 'Course'],
    }),

    getLessonProgress: builder.query({
      query: (lessonId) => API_ENDPOINTS.PROGRESS.BY_LESSON(lessonId),
      providesTags: (result, error, lessonId) => [
        { type: 'Progress', id: lessonId },
      ],
    }),

    getCourseProgress: builder.query({
      query: (courseId) => API_ENDPOINTS.PROGRESS.BY_COURSE(courseId),
      providesTags: (result, error, courseId) => [
        { type: 'Progress', id: courseId },
      ],
    }),

    getCourseProgressSummary: builder.query({
      query: (courseId) => API_ENDPOINTS.PROGRESS.SUMMARY(courseId),
      providesTags: (result, error, courseId) => [
        { type: 'Progress', id: courseId },
      ],
    }),

    getProgressStatistics: builder.query({
      query: () => API_ENDPOINTS.PROGRESS.STATISTICS,
      providesTags: ['Progress'],
    }),

    getRecentActivity: builder.query({
      query: () => API_ENDPOINTS.PROGRESS.RECENT_ACTIVITY,
      providesTags: ['Progress'],
    }),

    getLeaderboard: builder.query({
      query: (params) => ({
        url: '/progress/leaderboard',
        params,
      }),
      providesTags: ['Progress'],
    }),

    getNextLesson: builder.query({
      query: (courseId) => API_ENDPOINTS.PROGRESS.NEXT_LESSON(courseId),
      providesTags: ['Progress', 'Lesson'],
    }),

    checkCourseCompleted: builder.query({
      query: (courseId) => `/progress/course/${courseId}/completed`,
      providesTags: (result, error, courseId) => [
        { type: 'Progress', id: courseId },
      ],
    }),

    deleteLessonProgress: builder.mutation({
      query: (lessonId) => ({
        url: `/progress/lesson/${lessonId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Progress'],
    }),

    deleteCourseProgress: builder.mutation({
      query: (courseId) => ({
        url: `/progress/course/${courseId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Progress'],
    }),

    bulkUpdateProgress: builder.mutation({
      query: (progressData) => ({
        url: '/progress/bulk',
        method: 'POST',
        body: progressData,
      }),
      invalidatesTags: ['Progress'],
    }),

    getLearningPath: builder.query({
      query: () => '/progress/learning-path',
      providesTags: ['Progress'],
    }),

    getLearningTrends: builder.query({
      query: (params) => ({
        url: '/progress/trends',
        params,
      }),
      providesTags: ['Progress'],
    }),

    getCourseAnalytics: builder.query({
      query: (courseId) => `/progress/analytics/course/${courseId}`,
      providesTags: (result, error, courseId) => [
        { type: 'Progress', id: courseId },
      ],
    }),

    getLessonAnalytics: builder.query({
      query: (lessonId) => `/progress/analytics/lesson/${lessonId}`,
      providesTags: (result, error, lessonId) => [
        { type: 'Progress', id: lessonId },
      ],
    }),

    getCourseStudents: builder.query({
      query: (courseId) => `/progress/course/${courseId}/students`,
      providesTags: (result, error, courseId) => [
        { type: 'Progress', id: courseId },
      ],
    }),

    getStudentEngagement: builder.query({
      query: (courseId) => `/progress/engagement/course/${courseId}`,
      providesTags: (result, error, courseId) => [
        { type: 'Progress', id: courseId },
      ],
    }),

    getUserProgressById: builder.query({
      query: (userId) => `/progress/user/${userId}`,
      providesTags: (result, error, userId) => [
        { type: 'Progress', id: userId },
      ],
    }),

    deleteUserCourseProgress: builder.mutation({
      query: ({ userId, courseId }) => ({
        url: `/progress/user/${userId}/course/${courseId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Progress'],
    }),
  }),
});

export const {
  useGetUserProgressQuery,
  useUpdateProgressMutation,
  useCompleteLessonMutation,
  useGetLessonProgressQuery,
  useGetCourseProgressQuery,
  useGetCourseProgressSummaryQuery,
  useGetProgressStatisticsQuery,
  useGetRecentActivityQuery,
  useGetLeaderboardQuery,
  useGetNextLessonQuery,
  useCheckCourseCompletedQuery,
  useDeleteLessonProgressMutation,
  useDeleteCourseProgressMutation,
  useBulkUpdateProgressMutation,
  useGetLearningPathQuery,
  useGetLearningTrendsQuery,
  useGetCourseAnalyticsQuery,
  useGetLessonAnalyticsQuery,
  useGetCourseStudentsQuery,
  useGetStudentEngagementQuery,
  useGetUserProgressByIdQuery,
  useDeleteUserCourseProgressMutation,
} = progressApi;
