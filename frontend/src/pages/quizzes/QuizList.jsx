import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Quiz as QuizIcon,
  PlayArrow as PlayIcon,
  CheckCircle as CheckCircleIcon,
  Lock as LockIcon,
  Timer as TimerIcon,
  EmojiEvents as TrophyIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useGetQuizzesByCourseQuery, useCanTakeQuizQuery } from '../../store/api/quizzesApi';

function QuizList() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: quizzesData, isLoading, error } = useGetQuizzesByCourseQuery(courseId);

  const quizzes = quizzesData?.data || [];

  const getFilteredQuizzes = () => {
    let filtered = quizzes;

    if (filter === 'completed') {
      filtered = quizzes.filter((quiz) => quiz.userAttempts?.some((attempt) => attempt.completed));
    } else if (filter === 'pending') {
      filtered = quizzes.filter((quiz) => !quiz.userAttempts || quiz.userAttempts.length === 0);
    } else if (filter === 'passed') {
      filtered = quizzes.filter((quiz) => quiz.userAttempts?.some((attempt) => attempt.passed));
    }

    if (searchTerm) {
      filtered = filtered.filter((quiz) =>
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const getQuizStatus = (quiz) => {
    if (!quiz.userAttempts || quiz.userAttempts.length === 0) {
      return { status: 'not_started', label: 'لم يبدأ', color: 'default' };
    }

    const lastAttempt = quiz.userAttempts[0];

    if (lastAttempt.passed) {
      return { status: 'passed', label: 'نجحت', color: 'success' };
    }

    if (lastAttempt.completed) {
      return { status: 'failed', label: 'لم تنجح', color: 'error' };
    }

    return { status: 'in_progress', label: 'قيد التقدم', color: 'warning' };
  };

  const getBestScore = (quiz) => {
    if (!quiz.userAttempts || quiz.userAttempts.length === 0) return null;

    const scores = quiz.userAttempts.map((attempt) => attempt.scorePercentage || 0);
    return Math.max(...scores);
  };

  const getAttemptsInfo = (quiz) => {
    const attempts = quiz.userAttempts?.length || 0;
    const maxAttempts = quiz.maxAttempts || Infinity;

    return { attempts, maxAttempts, canRetry: maxAttempts === Infinity || attempts < maxAttempts };
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <LinearProgress />
          <Typography sx={{ mt: 2 }}>جاري تحميل الاختبارات...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          {error?.data?.message || 'فشل في تحميل الاختبارات'}
        </Alert>
      </Container>
    );
  }

  const filteredQuizzes = getFilteredQuizzes();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          الاختبارات
        </Typography>
        <Typography variant="body1" color="text.secondary">
          اختبر معلوماتك وتقدم في الدورة
        </Typography>
      </Box>

      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="البحث في الاختبارات..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 250 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>تصفية حسب</InputLabel>
          <Select
            value={filter}
            label="تصفية حسب"
            onChange={(e) => setFilter(e.target.value)}
          >
            <MenuItem value="all">جميع الاختبارات</MenuItem>
            <MenuItem value="pending">لم يبدأ</MenuItem>
            <MenuItem value="completed">مكتمل</MenuItem>
            <MenuItem value="passed">ناجح</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {filteredQuizzes.length === 0 ? (
        <Alert severity="info">
          {searchTerm || filter !== 'all'
            ? 'لم يتم العثور على اختبارات تطابق معايير البحث'
            : 'لا توجد اختبارات متاحة في هذه الدورة'}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredQuizzes.map((quiz) => {
            const status = getQuizStatus(quiz);
            const bestScore = getBestScore(quiz);
            const { attempts, maxAttempts, canRetry } = getAttemptsInfo(quiz);

            return (
              <Grid item xs={12} md={6} key={quiz.id}>
                <Card
                  elevation={3}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <QuizIcon color="primary" sx={{ fontSize: 40 }} />
                      <Chip
                        label={status.label}
                        color={status.color}
                        size="small"
                      />
                    </Box>

                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {quiz.title}
                    </Typography>

                    {quiz.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {quiz.description}
                      </Typography>
                    )}

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {quiz.timeLimit && (
                        <Chip
                          icon={<TimerIcon />}
                          label={`${quiz.timeLimit} دقيقة`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                      {quiz.questionCount && (
                        <Chip
                          label={`${quiz.questionCount} سؤال`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                      {quiz.passingScore && (
                        <Chip
                          label={`نسبة النجاح: ${quiz.passingScore}%`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>

                    {bestScore !== null && (
                      <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            أفضل درجة
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {bestScore.toFixed(1)}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={bestScore}
                          sx={{ height: 8, borderRadius: 4 }}
                          color={bestScore >= (quiz.passingScore || 50) ? 'success' : 'error'}
                        />
                      </Box>
                    )}

                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        المحاولات: {attempts}
                        {maxAttempts !== Infinity && ` / ${maxAttempts}`}
                      </Typography>
                      {status.status === 'passed' && (
                        <TrophyIcon color="success" />
                      )}
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    {quiz.isLocked ? (
                      <Button
                        fullWidth
                        variant="outlined"
                        disabled
                        startIcon={<LockIcon />}
                      >
                        مغلق
                      </Button>
                    ) : (
                      <>
                        {status.status === 'not_started' || canRetry ? (
                          <Button
                            fullWidth
                            variant="contained"
                            startIcon={<PlayIcon />}
                            onClick={() => navigate(`/quizzes/${quiz.id}/take`)}
                          >
                            {status.status === 'not_started' ? 'بدء الاختبار' : 'إعادة المحاولة'}
                          </Button>
                        ) : (
                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<CheckCircleIcon />}
                            onClick={() => {
                              const lastAttemptId = quiz.userAttempts[0]?.id;
                              navigate(`/quizzes/${quiz.id}/results/${lastAttemptId}`);
                            }}
                          >
                            عرض النتائج
                          </Button>
                        )}

                        {quiz.userAttempts && quiz.userAttempts.length > 0 && (
                          <Button
                            variant="text"
                            onClick={() => navigate(`/quizzes/${quiz.id}/attempts`)}
                          >
                            السجل
                          </Button>
                        )}
                      </>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
}

export default QuizList;
