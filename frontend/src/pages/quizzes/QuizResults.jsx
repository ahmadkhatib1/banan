import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Collapse,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  EmojiEvents as TrophyIcon,
  Refresh as RefreshIcon,
  ArrowForward as ArrowForwardIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useGetQuizResultsQuery } from '../../store/api/quizzesApi';

function QuizResults() {
  const { id, attemptId } = useParams();
  const navigate = useNavigate();
  const { data: resultsData, isLoading, error } = useGetQuizResultsQuery({ id, attemptId });

  const [expandedQuestions, setExpandedQuestions] = useState({});

  const results = resultsData?.data;
  const quiz = results?.quiz;
  const attempt = results?.attempt;
  const questions = results?.questions || [];

  const toggleQuestion = (questionId) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <LinearProgress />
          <Typography sx={{ mt: 2 }}>جاري تحميل النتائج...</Typography>
        </Box>
      </Container>
    );
  }

  if (error || !results) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          {error?.data?.message || 'فشل في تحميل نتائج الاختبار'}
        </Alert>
      </Container>
    );
  }

  const scorePercentage = attempt?.scorePercentage || 0;
  const passed = attempt?.passed || false;
  const correctAnswers = questions.filter((q) => q.isCorrect).length;
  const totalQuestions = questions.length;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4, textAlign: 'center' }}>
        <Box sx={{ mb: 3 }}>
          {passed ? (
            <TrophyIcon sx={{ fontSize: 80, color: 'success.main' }} />
          ) : (
            <CancelIcon sx={{ fontSize: 80, color: 'error.main' }} />
          )}
        </Box>

        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {passed ? 'مبروك! لقد نجحت' : 'للأسف، لم تنجح في الاختبار'}
        </Typography>

        <Typography variant="h2" fontWeight="bold" sx={{ my: 3, color: passed ? 'success.main' : 'error.main' }}>
          {scorePercentage.toFixed(1)}%
        </Typography>

        <Typography variant="body1" color="text.secondary" gutterBottom>
          {quiz?.title}
        </Typography>

        {quiz?.passingScore && (
          <Typography variant="body2" color="text.secondary">
            درجة النجاح المطلوبة: {quiz.passingScore}%
          </Typography>
        )}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
          {attempt?.canRetry && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={() => navigate(`/quizzes/${id}/take`)}
            >
              إعادة المحاولة
            </Button>
          )}
          {attempt?.unlockedLessonId && (
            <Button
              variant="contained"
              color="success"
              startIcon={<ArrowForwardIcon />}
              onClick={() => navigate(`/lessons/${attempt.unlockedLessonId}`)}
            >
              انتقل للدرس التالي
            </Button>
          )}
          <Button
            variant="outlined"
            onClick={() => navigate(`/courses/${quiz?.courseId}`)}
          >
            العودة للدورة
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {attempt?.score || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                النقاط المكتسبة
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {correctAnswers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                إجابات صحيحة
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {totalQuestions - correctAnswers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                إجابات خاطئة
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold">
                {attempt?.attemptNumber || 1}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                رقم المحاولة
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {quiz?.showResults && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            تفاصيل الإجابات
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <List>
            {questions.map((question, index) => (
              <Box key={question.id}>
                <ListItem
                  sx={{
                    bgcolor: question.isCorrect ? 'success.50' : 'error.50',
                    borderRadius: 1,
                    mb: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: question.isCorrect ? 'success.100' : 'error.100' },
                  }}
                  onClick={() => toggleQuestion(question.id)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    {question.isCorrect ? (
                      <CheckCircleIcon color="success" sx={{ mr: 2 }} />
                    ) : (
                      <CancelIcon color="error" sx={{ mr: 2 }} />
                    )}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" fontWeight="medium">
                        السؤال {index + 1}: {question.question}
                      </Typography>
                      <Chip
                        label={`${question.points || 1} نقطة`}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                    {expandedQuestions[question.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </Box>
                </ListItem>

                <Collapse in={expandedQuestions[question.id]}>
                  <Paper variant="outlined" sx={{ p: 3, mb: 2, ml: 6 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          إجابتك:
                        </Typography>
                        <Paper
                          sx={{
                            p: 2,
                            bgcolor: question.isCorrect ? 'success.50' : 'error.50',
                            border: 1,
                            borderColor: question.isCorrect ? 'success.main' : 'error.main',
                          }}
                        >
                          <Typography>
                            {question.userAnswer || 'لم يتم الإجابة'}
                          </Typography>
                        </Paper>
                      </Grid>

                      {!question.isCorrect && question.correctAnswer && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            الإجابة الصحيحة:
                          </Typography>
                          <Paper
                            sx={{
                              p: 2,
                              bgcolor: 'success.50',
                              border: 1,
                              borderColor: 'success.main',
                            }}
                          >
                            <Typography>{question.correctAnswer}</Typography>
                          </Paper>
                        </Grid>
                      )}

                      {question.explanation && (
                        <Grid item xs={12}>
                          <Alert severity="info" icon={false}>
                            <Typography variant="body2" fontWeight="medium" gutterBottom>
                              التوضيح:
                            </Typography>
                            <Typography variant="body2">{question.explanation}</Typography>
                          </Alert>
                        </Grid>
                      )}
                    </Grid>
                  </Paper>
                </Collapse>
              </Box>
            ))}
          </List>
        </Paper>
      )}

      {!quiz?.showResults && (
        <Alert severity="info">
          المدرس اختار عدم إظهار الإجابات التفصيلية لهذا الاختبار.
        </Alert>
      )}

      {attempt?.feedback && (
        <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            ملاحظات المدرس
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography>{attempt.feedback}</Typography>
        </Paper>
      )}
    </Container>
  );
}

export default QuizResults;
