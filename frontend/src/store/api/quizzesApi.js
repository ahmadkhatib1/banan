import { apiSlice } from './apiSlice';
import { API_ENDPOINTS } from '../../utils/apiConfig';

export const quizzesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getQuizzes: builder.query({
      query: (params) => ({
        url: API_ENDPOINTS.QUIZZES.BASE,
        params,
      }),
      providesTags: ['Quiz'],
    }),

    getQuizById: builder.query({
      query: (id) => API_ENDPOINTS.QUIZZES.BY_ID(id),
      providesTags: (result, error, id) => [{ type: 'Quiz', id }],
    }),

    getQuizzesByCourse: builder.query({
      query: (courseId) => API_ENDPOINTS.QUIZZES.BY_COURSE(courseId),
      providesTags: ['Quiz'],
    }),

    getQuizzesByLesson: builder.query({
      query: (lessonId) => API_ENDPOINTS.QUIZZES.BY_LESSON(lessonId),
      providesTags: ['Quiz'],
    }),

    createQuiz: builder.mutation({
      query: (quizData) => ({
        url: API_ENDPOINTS.QUIZZES.BASE,
        method: 'POST',
        body: quizData,
      }),
      invalidatesTags: ['Quiz'],
    }),

    updateQuiz: builder.mutation({
      query: ({ id, ...quizData }) => ({
        url: API_ENDPOINTS.QUIZZES.BY_ID(id),
        method: 'PUT',
        body: quizData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Quiz', id }],
    }),

    deleteQuiz: builder.mutation({
      query: (id) => ({
        url: API_ENDPOINTS.QUIZZES.BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Quiz'],
    }),

    takeQuiz: builder.mutation({
      query: ({ id, answers }) => ({
        url: API_ENDPOINTS.QUIZZES.TAKE(id),
        method: 'POST',
        body: { answers },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Quiz', id },
        'Progress',
      ],
    }),

    getQuizAttempts: builder.query({
      query: (id) => API_ENDPOINTS.QUIZZES.ATTEMPTS(id),
      providesTags: (result, error, id) => [{ type: 'Quiz', id }],
    }),

    getQuizResults: builder.query({
      query: ({ id, attemptId }) => `${API_ENDPOINTS.QUIZZES.BY_ID(id)}/results/${attemptId}`,
      providesTags: (result, error, { id }) => [{ type: 'Quiz', id }],
    }),

    canTakeQuiz: builder.query({
      query: (id) => API_ENDPOINTS.QUIZZES.CAN_TAKE(id),
      providesTags: (result, error, id) => [{ type: 'Quiz', id }],
    }),

    getQuizStatistics: builder.query({
      query: (id) => API_ENDPOINTS.QUIZZES.STATISTICS(id),
      providesTags: (result, error, id) => [{ type: 'Quiz', id }],
    }),

    addQuestion: builder.mutation({
      query: ({ quizId, questionData }) => ({
        url: `${API_ENDPOINTS.QUIZZES.BY_ID(quizId)}/questions`,
        method: 'POST',
        body: questionData,
      }),
      invalidatesTags: (result, error, { quizId }) => [{ type: 'Quiz', id: quizId }],
    }),

    updateQuestion: builder.mutation({
      query: ({ quizId, questionId, questionData }) => ({
        url: `${API_ENDPOINTS.QUIZZES.BY_ID(quizId)}/questions/${questionId}`,
        method: 'PUT',
        body: questionData,
      }),
      invalidatesTags: (result, error, { quizId }) => [{ type: 'Quiz', id: quizId }],
    }),

    deleteQuestion: builder.mutation({
      query: ({ quizId, questionId }) => ({
        url: `${API_ENDPOINTS.QUIZZES.BY_ID(quizId)}/questions/${questionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { quizId }) => [{ type: 'Quiz', id: quizId }],
    }),

    publishQuiz: builder.mutation({
      query: (id) => ({
        url: `${API_ENDPOINTS.QUIZZES.BY_ID(id)}/publish`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Quiz', id }],
    }),

    unpublishQuiz: builder.mutation({
      query: (id) => ({
        url: `${API_ENDPOINTS.QUIZZES.BY_ID(id)}/unpublish`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Quiz', id }],
    }),
  }),
});

export const {
  useGetQuizzesQuery,
  useGetQuizByIdQuery,
  useGetQuizzesByCourseQuery,
  useGetQuizzesByLessonQuery,
  useCreateQuizMutation,
  useUpdateQuizMutation,
  useDeleteQuizMutation,
  useTakeQuizMutation,
  useGetQuizAttemptsQuery,
  useGetQuizResultsQuery,
  useCanTakeQuizQuery,
  useGetQuizStatisticsQuery,
  useAddQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  usePublishQuizMutation,
  useUnpublishQuizMutation,
} = quizzesApi;
