import { apiSlice } from './apiSlice';
import { API_ENDPOINTS } from '../../utils/apiConfig';

export const lessonsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getLessons: builder.query({
      query: (params) => ({
        url: API_ENDPOINTS.LESSONS.BASE,
        params,
      }),
      providesTags: ['Lesson'],
    }),

    getLessonById: builder.query({
      query: (id) => API_ENDPOINTS.LESSONS.BY_ID(id),
      providesTags: (result, error, id) => [{ type: 'Lesson', id }],
    }),

    getLessonsByCourse: builder.query({
      query: (courseId) => API_ENDPOINTS.LESSONS.BY_COURSE(courseId),
      providesTags: ['Lesson'],
    }),

    createLesson: builder.mutation({
      query: (lessonData) => ({
        url: API_ENDPOINTS.LESSONS.BASE,
        method: 'POST',
        body: lessonData,
      }),
      invalidatesTags: ['Lesson', 'Course'],
    }),

    updateLesson: builder.mutation({
      query: ({ id, ...lessonData }) => ({
        url: API_ENDPOINTS.LESSONS.BY_ID(id),
        method: 'PUT',
        body: lessonData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Lesson', id }],
    }),

    deleteLesson: builder.mutation({
      query: (id) => ({
        url: API_ENDPOINTS.LESSONS.BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Lesson', 'Course'],
    }),

    getLessonProgress: builder.query({
      query: (id) => API_ENDPOINTS.LESSONS.PROGRESS(id),
      providesTags: (result, error, id) => [
        { type: 'Lesson', id },
        'Progress',
      ],
    }),

    updateLessonProgress: builder.mutation({
      query: ({ id, progress }) => ({
        url: API_ENDPOINTS.LESSONS.PROGRESS(id),
        method: 'POST',
        body: { progress },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Lesson', id },
        'Progress',
      ],
    }),

    completeLesson: builder.mutation({
      query: (id) => ({
        url: API_ENDPOINTS.LESSONS.COMPLETE(id),
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Lesson', id },
        'Progress',
        'Course',
      ],
    }),

    getNextLesson: builder.query({
      query: (id) => API_ENDPOINTS.LESSONS.NEXT(id),
      providesTags: ['Lesson'],
    }),

    getPreviousLesson: builder.query({
      query: (id) => API_ENDPOINTS.LESSONS.PREVIOUS(id),
      providesTags: ['Lesson'],
    }),

    getCurrentLesson: builder.query({
      query: (courseId) => API_ENDPOINTS.LESSONS.CURRENT(courseId),
      providesTags: ['Lesson', 'Progress'],
    }),

    checkLessonAccess: builder.query({
      query: (id) => API_ENDPOINTS.LESSONS.CAN_ACCESS(id),
      providesTags: (result, error, id) => [{ type: 'Lesson', id }],
    }),
  }),
});

export const {
  useGetLessonsQuery,
  useGetLessonByIdQuery,
  useGetLessonsByCourseQuery,
  useCreateLessonMutation,
  useUpdateLessonMutation,
  useDeleteLessonMutation,
  useGetLessonProgressQuery,
  useUpdateLessonProgressMutation,
  useCompleteLessonMutation,
  useGetNextLessonQuery,
  useGetPreviousLessonQuery,
  useGetCurrentLessonQuery,
  useCheckLessonAccessQuery,
} = lessonsApi;
