import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  LinearProgress,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Quiz as QuizIcon,
  Timer as TimerIcon,
  CheckCircle as CheckCircleIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetQuizzesByCourseQuery } from '../../store/api/quizzesApi';

const QuizList = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { data: quizzes, isLoading, error } = useGetQuizzesByCourseQuery(courseId);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">فشل في تحميل الاختبارات. يرجى المحاولة مرة أخرى.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          الاختبارات
        </Typography>
        <Typography variant="body1" color="text.secondary">
          اختبر معلوماتك وتقدم في الدورة
        </Typography>
      </Box>

      {!quizzes || quizzes.length === 0 ? (
        <Alert severity="info">لا توجد اختبارات متاحة حالياً في هذه الدورة.</Alert>
      ) : (
        <Grid container spacing={3}>
          {quizzes.map((quiz) => (
            <Grid item xs={12} md={6} key={quiz.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <QuizIcon color="primary" />
                    <Typography variant="h6" component="h2">
                      {quiz.title}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" paragraph>
                    {quiz.description}
                  </Typography>

                  <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                    {quiz.time_limit && (
                      <Chip
                        icon={<TimerIcon />}
                        label={`${quiz.time_limit} دقيقة`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                    <Chip
                      label={`نسبة النجاح: ${quiz.passing_score}%`}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                    {quiz.max_attempts && (
                      <Chip
                        label={`المحاولات: ${quiz.attempts_count || 0}/${quiz.max_attempts}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  {quiz.requires_passing && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      يجب النجاح في هذا الاختبار للمتابعة
                    </Alert>
                  )}

                  {quiz.user_best_score && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        أفضل نتيجة: {quiz.user_best_score}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={quiz.user_best_score}
                        color={quiz.user_best_score >= quiz.passing_score ? 'success' : 'warning'}
                      />
                    </Box>
                  )}
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  {quiz.is_locked ? (
                    <Button
                      fullWidth
                      variant="outlined"
                      disabled
                      startIcon={<LockIcon />}
                    >
                      مغلق
                    </Button>
                  ) : quiz.is_passed ? (
                    <Button
                      fullWidth
                      variant="outlined"
                      color="success"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => navigate(`/quizzes/${quiz.id}/results`)}
                    >
                      عرض النتائج
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => navigate(`/quizzes/${quiz.id}/take`)}
                    >
                      بدء الاختبار
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default QuizList;
