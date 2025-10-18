import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import { useGetQuizStatisticsQuery } from '../../store/api/quizzesApi';

function QuizAnalytics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: statsData, isLoading, error } = useGetQuizStatisticsQuery(id);

  const stats = statsData?.data;

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <LinearProgress />
          <Typography sx={{ mt: 2 }}>جاري تحميل التحليلات...</Typography>
        </Box>
      </Container>
    );
  }

  if (error || !stats) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          {error?.data?.message || 'فشل في تحميل تحليلات الاختبار'}
        </Alert>
      </Container>
    );
  }

  const passRate = stats.totalAttempts > 0
    ? ((stats.passedAttempts / stats.totalAttempts) * 100).toFixed(1)
    : 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate(-1)}>
          <BackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            تحليلات الاختبار
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {stats.quiz?.title}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PeopleIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats.totalStudents || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                إجمالي الطلاب
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircleIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {stats.passedAttempts || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                محاولات ناجحة
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CancelIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {stats.failedAttempts || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                محاولات فاشلة
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrophyIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {passRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                معدل النجاح
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              الإحصائيات العامة
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  متوسط الدرجات
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {stats.averageScore?.toFixed(1) || 0}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={stats.averageScore || 0}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  أعلى درجة
                </Typography>
                <Typography variant="body2" fontWeight="bold" color="success.main">
                  {stats.highestScore?.toFixed(1) || 0}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={stats.highestScore || 0}
                color="success"
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  أقل درجة
                </Typography>
                <Typography variant="body2" fontWeight="bold" color="error.main">
                  {stats.lowestScore?.toFixed(1) || 0}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={stats.lowestScore || 0}
                color="error"
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              معلومات إضافية
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
              <Typography variant="body2" color="text.secondary">
                إجمالي المحاولات
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {stats.totalAttempts || 0}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
              <Typography variant="body2" color="text.secondary">
                متوسط المحاولات لكل طالب
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {stats.averageAttemptsPerStudent?.toFixed(1) || 0}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
              <Typography variant="body2" color="text.secondary">
                متوسط الوقت المستغرق
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {stats.averageTimeSpent
                  ? `${Math.floor(stats.averageTimeSpent / 60)} دقيقة`
                  : 'غير متوفر'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
              <Typography variant="body2" color="text.secondary">
                عدد الأسئلة
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {stats.quiz?.questionCount || 0}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {stats.questionAnalytics && stats.questionAnalytics.length > 0 && (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            تحليل الأسئلة
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>السؤال</TableCell>
                  <TableCell align="center">نسبة النجاح</TableCell>
                  <TableCell align="center">إجابات صحيحة</TableCell>
                  <TableCell align="center">إجابات خاطئة</TableCell>
                  <TableCell align="center">الصعوبة</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.questionAnalytics.map((qa, index) => {
                  const successRate = qa.totalAnswers > 0
                    ? ((qa.correctAnswers / qa.totalAnswers) * 100).toFixed(1)
                    : 0;

                  let difficulty = 'سهل';
                  let difficultyColor = 'success';
                  if (successRate < 40) {
                    difficulty = 'صعب';
                    difficultyColor = 'error';
                  } else if (successRate < 70) {
                    difficulty = 'متوسط';
                    difficultyColor = 'warning';
                  }

                  return (
                    <TableRow key={qa.questionId}>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 400 }}>
                          {index + 1}. {qa.question}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          {successRate >= 50 ? (
                            <TrendingUpIcon color="success" fontSize="small" />
                          ) : (
                            <TrendingDownIcon color="error" fontSize="small" />
                          )}
                          <Typography variant="body2" fontWeight="bold">
                            {successRate}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color="success.main" fontWeight="bold">
                          {qa.correctAnswers || 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color="error.main" fontWeight="bold">
                          {qa.incorrectAnswers || 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={difficulty}
                          color={difficultyColor}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {stats.topStudents && stats.topStudents.length > 0 && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            أفضل الطلاب
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            {stats.topStudents.map((student, index) => (
              <Grid item xs={12} sm={6} md={4} key={student.userId}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: index === 0 ? 'warning.main' : index === 1 ? 'grey.400' : 'error.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                        }}
                      >
                        {index + 1}
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1" fontWeight="bold">
                          {student.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {student.score?.toFixed(1)}% | {student.attempts} محاولة
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </Container>
  );
}

export default QuizAnalytics;
