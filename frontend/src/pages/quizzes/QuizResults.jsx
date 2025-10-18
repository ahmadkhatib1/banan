import { useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  EmojiEvents as TrophyIcon,
  Replay as ReplayIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useGetQuizAttemptsQuery } from '../../store/api/quizzesApi';

const QuizResults = () => {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const location = useLocation();
  const { data: attempts, isLoading, error } = useGetQuizAttemptsQuery(quizId);

  const latestAttempt = attempts?.[0];

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !latestAttempt) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">فشل في تحميل النتائج. يرجى المحاولة مرة أخرى.</Alert>
      </Container>
    );
  }

  const isPassed = latestAttempt.is_passed;
  const score = latestAttempt.score;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Card
        sx={{
          textAlign: 'center',
          py: 4,
          background: isPassed
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="center" mb={2}>
            {isPassed ? (
              <TrophyIcon sx={{ fontSize: 80 }} />
            ) : (
              <CancelIcon sx={{ fontSize: 80 }} />
            )}
          </Box>

          <Typography variant="h3" gutterBottom fontWeight="bold">
            {isPassed ? 'مبروك! لقد نجحت' : 'للأسف، لم تنجح'}
          </Typography>

          <Typography variant="h1" sx={{ my: 3, fontWeight: 'bold' }}>
            {score}%
          </Typography>

          <Typography variant="h6">
            {isPassed
              ? 'أحسنت! لقد تجاوزت الاختبار بنجاح'
              : `تحتاج إلى ${latestAttempt.quiz?.passing_score}% للنجاح`}
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            تفاصيل المحاولة
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box display="flex" gap={2} flexWrap="wrap">
            <Chip
              label={`النتيجة: ${score}%`}
              color={isPassed ? 'success' : 'error'}
            />
            <Chip label={`الوقت المستغرق: ${Math.round(latestAttempt.time_spent / 60)} دقيقة`} />
            <Chip
              label={`المحاولة رقم ${latestAttempt.attempt_number}`}
              color="primary"
            />
          </Box>

          {latestAttempt.unlocked_lesson && (
            <Alert severity="success" sx={{ mt: 3 }} icon={<CheckCircleIcon />}>
              تم فتح الدرس التالي: {latestAttempt.unlocked_lesson.title}
            </Alert>
          )}
        </CardContent>
      </Card>

      {latestAttempt.answers && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              مراجعة الإجابات
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <List>
              {latestAttempt.answers.map((answer, index) => (
                <ListItem
                  key={index}
                  sx={{
                    display: 'block',
                    mb: 2,
                    p: 2,
                    bgcolor: answer.is_correct ? 'success.light' : 'error.light',
                    borderRadius: 1,
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    {answer.is_correct ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <CancelIcon color="error" />
                    )}
                    <Typography variant="subtitle1" fontWeight="bold">
                      السؤال {index + 1}
                    </Typography>
                  </Box>

                  <Typography variant="body2" paragraph>
                    {answer.question_text}
                  </Typography>

                  <Typography
                    variant="body2"
                    color={answer.is_correct ? 'success.dark' : 'error.dark'}
                  >
                    إجابتك: {answer.user_answer}
                  </Typography>

                  {!answer.is_correct && (
                    <Typography variant="body2" color="success.dark">
                      الإجابة الصحيحة: {answer.correct_answer}
                    </Typography>
                  )}

                  {answer.explanation && (
                    <Alert severity="info" sx={{ mt: 1 }}>
                      {answer.explanation}
                    </Alert>
                  )}
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      <Box display="flex" gap={2} justifyContent="center" mt={4}>
        {!isPassed && latestAttempt.can_retake && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<ReplayIcon />}
            onClick={() => navigate(`/quizzes/${quizId}/take`)}
          >
            إعادة المحاولة
          </Button>
        )}

        <Button
          variant="outlined"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/dashboard')}
        >
          العودة للرئيسية
        </Button>
      </Box>

      {attempts && attempts.length > 1 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              المحاولات السابقة
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <List>
              {attempts.map((attempt, index) => (
                <ListItem key={attempt.id} divider={index < attempts.length - 1}>
                  <ListItemText
                    primary={`المحاولة ${index + 1}`}
                    secondary={`النتيجة: ${attempt.score}% - ${
                      attempt.is_passed ? 'نجح' : 'لم ينجح'
                    }`}
                  />
                  <Chip
                    label={attempt.score + '%'}
                    color={attempt.is_passed ? 'success' : 'error'}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default QuizResults;
