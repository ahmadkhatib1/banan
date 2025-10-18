import { apiSlice } from './apiSlice';
import { API_ENDPOINTS } from '../../utils/apiConfig';

export const coursesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCourses: builder.query({
      query: (params) => ({
        url: API_ENDPOINTS.COURSES.BASE,
        params,
      }),
      providesTags: ['Course'],
    }),

    getCourseById: builder.query({
      query: (id) => API_ENDPOINTS.COURSES.BY_ID(id),
      providesTags: (result, error, id) => [{ type: 'Course', id }],
    }),

    getPopularCourses: builder.query({
      query: () => API_ENDPOINTS.COURSES.POPULAR,
      providesTags: ['Course'],
    }),

    searchCourses: builder.query({
      query: (searchTerm) => ({
        url: API_ENDPOINTS.COURSES.SEARCH,
        params: { q: searchTerm },
      }),
      providesTags: ['Course'],
    }),

    getMyCourses: builder.query({
      query: () => API_ENDPOINTS.COURSES.MY_COURSES,
      providesTags: ['Course'],
    }),

    createCourse: builder.mutation({
      query: (courseData) => ({
        url: API_ENDPOINTS.COURSES.BASE,
        method: 'POST',
        body: courseData,
      }),
      invalidatesTags: ['Course'],
    }),

    updateCourse: builder.mutation({
      query: ({ id, ...courseData }) => ({
        url: API_ENDPOINTS.COURSES.BY_ID(id),
        method: 'PUT',
        body: courseData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Course', id }],
    }),

    deleteCourse: builder.mutation({
      query: (id) => ({
        url: API_ENDPOINTS.COURSES.BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Course'],
    }),

    enrollInCourse: builder.mutation({
      query: (id) => ({
        url: API_ENDPOINTS.COURSES.ENROLL(id),
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Course', id },
        'Progress',
      ],
    }),

    unenrollFromCourse: builder.mutation({
      query: (id) => ({
        url: API_ENDPOINTS.COURSES.UNENROLL(id),
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Course', id },
        'Progress',
      ],
    }),

    getCourseLessons: builder.query({
      query: (id) => API_ENDPOINTS.COURSES.LESSONS(id),
      providesTags: (result, error, id) => [{ type: 'Course', id }, 'Lesson'],
    }),

    getCourseQuizzes: builder.query({
      query: (id) => API_ENDPOINTS.COURSES.QUIZZES(id),
      providesTags: (result, error, id) => [{ type: 'Course', id }, 'Quiz'],
    }),

    rateCourse: builder.mutation({
      query: ({ id, rating, review }) => ({
        url: API_ENDPOINTS.COURSES.RATE(id),
        method: 'POST',
        body: { rating, review },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Course', id }],
    }),

    getCourseRatings: builder.query({
      query: (id) => API_ENDPOINTS.COURSES.RATINGS(id),
      providesTags: (result, error, id) => [{ type: 'Course', id }],
    }),

    getCourseStudents: builder.query({
      query: (id) => API_ENDPOINTS.COURSES.STUDENTS(id),
      providesTags: (result, error, id) => [{ type: 'Course', id }],
    }),

    getCourseAnalytics: builder.query({
      query: (id) => API_ENDPOINTS.COURSES.ANALYTICS(id),
      providesTags: (result, error, id) => [{ type: 'Course', id }],
    }),
  }),
});

export const {
  useGetCoursesQuery,
  useGetCourseByIdQuery,
  useGetPopularCoursesQuery,
  useSearchCoursesQuery,
  useGetMyCoursesQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useEnrollInCourseMutation,
  useUnenrollFromCourseMutation,
  useGetCourseLessonsQuery,
  useGetCourseQuizzesQuery,
  useRateCourseMutation,
  useGetCourseRatingsQuery,
  useGetCourseStudentsQuery,
  useGetCourseAnalyticsQuery,
} = coursesApi;
