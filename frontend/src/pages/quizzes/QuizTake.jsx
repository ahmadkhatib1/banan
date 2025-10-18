import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Button,
  LinearProgress,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Timer as TimerIcon,
  Send as SendIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetQuizByIdQuery, useTakeQuizMutation } from '../../store/api/quizzesApi';

const QuizTake = () => {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const { data: quiz, isLoading, error } = useGetQuizByIdQuery(quizId);
  const [takeQuiz, { isLoading: isSubmitting }] = useTakeQuizMutation();

  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  useEffect(() => {
    if (quiz?.time_limit) {
      setTimeLeft(quiz.time_limit * 60);
    }
  }, [quiz]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer,
    });
  };

  const handleSubmit = async () => {
    setShowSubmitDialog(false);

    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));

      const result = await takeQuiz({
        id: quizId,
        answers: formattedAnswers,
      }).unwrap();

      navigate(`/quizzes/${quizId}/results`, {
        state: { attemptId: result.attempt_id, score: result.score },
      });
    } catch (err) {
      console.error('Failed to submit quiz:', err);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = quiz?.questions?.length || 0;
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

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
        <Alert severity="error">فشل في تحميل الاختبار. يرجى المحاولة مرة أخرى.</Alert>
      </Container>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="warning">لا توجد أسئلة في هذا الاختبار.</Alert>
      </Container>
    );
  }

  const currentQ = quiz.questions[currentQuestion];

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {quiz.title}
        </Typography>

        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          {timeLeft !== null && (
            <Chip
              icon={<TimerIcon />}
              label={formatTime(timeLeft)}
              color={timeLeft < 300 ? 'error' : 'primary'}
              sx={{ fontSize: '1.1rem', py: 2.5 }}
            />
          )}
          <Chip
            label={`السؤال ${currentQuestion + 1} من ${totalQuestions}`}
            color="secondary"
          />
          <Chip
            label={`تم الإجابة: ${answeredCount} من ${totalQuestions}`}
            color={answeredCount === totalQuestions ? 'success' : 'default'}
          />
        </Box>

        <Box sx={{ mt: 2 }}>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            السؤال {currentQuestion + 1}:
          </Typography>
          <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', mb: 3 }}>
            {currentQ.text}
          </Typography>

          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              value={answers[currentQ.id] || ''}
              onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
            >
              {currentQ.options?.map((option) => (
                <FormControlLabel
                  key={option.id}
                  value={option.id}
                  control={<Radio />}
                  label={option.text}
                  sx={{
                    mb: 1,
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </CardContent>
      </Card>

      <Box display="flex" justifyContent="space-between" gap={2}>
        <Button
          variant="outlined"
          disabled={currentQuestion === 0}
          onClick={() => setCurrentQuestion(currentQuestion - 1)}
        >
          السابق
        </Button>

        {currentQuestion < totalQuestions - 1 ? (
          <Button
            variant="contained"
            onClick={() => setCurrentQuestion(currentQuestion + 1)}
          >
            التالي
          </Button>
        ) : (
          <Button
            variant="contained"
            color="success"
            startIcon={<SendIcon />}
            onClick={() => setShowSubmitDialog(true)}
            disabled={answeredCount < totalQuestions}
          >
            إرسال الإجابات
          </Button>
        )}
      </Box>

      {answeredCount < totalQuestions && (
        <Alert severity="warning" sx={{ mt: 3 }} icon={<WarningIcon />}>
          يجب الإجابة على جميع الأسئلة قبل الإرسال ({totalQuestions - answeredCount} سؤال
          متبقي)
        </Alert>
      )}

      <Dialog open={showSubmitDialog} onClose={() => setShowSubmitDialog(false)}>
        <DialogTitle>تأكيد الإرسال</DialogTitle>
        <DialogContent>
          <Typography>
            هل أنت متأكد من إرسال إجاباتك؟ لن تتمكن من التعديل بعد الإرسال.
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            الأسئلة المجابة: {answeredCount} من {totalQuestions}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSubmitDialog(false)}>إلغاء</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'إرسال'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default QuizTake;
