import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  TextField,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import {
  Timer as TimerIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useGetQuizByIdQuery, useTakeQuizMutation } from '../../store/api/quizzesApi';

function QuizTake() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: quizData, isLoading, error } = useGetQuizByIdQuery(id);
  const [takeQuiz, { isLoading: isSubmitting }] = useTakeQuizMutation();

  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const quiz = quizData?.data;
  const questions = quiz?.questions || [];

  useEffect(() => {
    if (quiz?.timeLimit) {
      setTimeRemaining(quiz.timeLimit * 60);
    }
  }, [quiz]);

  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleAutoSubmit = async () => {
    await handleSubmit();
  };

  const handleSubmit = async () => {
    setShowSubmitDialog(false);
    setSubmitError(null);

    const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
      questionId: parseInt(questionId),
      answer: answer,
    }));

    try {
      const result = await takeQuiz({
        id: quiz.id,
        answers: formattedAnswers,
      }).unwrap();

      navigate(`/quizzes/${quiz.id}/results/${result.data.attemptId || result.data.id}`);
    } catch (err) {
      setSubmitError(err.data?.message || 'فشل في إرسال الإجابات. حاول مرة أخرى.');
    }
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const getProgress = () => {
    if (questions.length === 0) return 0;
    return (getAnsweredCount() / questions.length) * 100;
  };

  const isQuestionAnswered = (questionId) => {
    return answers.hasOwnProperty(questionId);
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <LinearProgress />
          <Typography sx={{ mt: 2 }}>جاري تحميل الاختبار...</Typography>
        </Box>
      </Container>
    );
  }

  if (error || !quiz) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          {error?.data?.message || 'فشل في تحميل الاختبار'}
        </Alert>
      </Container>
    );
  }

  const question = questions[currentQuestion];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold">
          {quiz.title}
        </Typography>
        {quiz.timeLimit && timeRemaining !== null && (
          <Chip
            icon={<TimerIcon />}
            label={formatTime(timeRemaining)}
            color={timeRemaining < 300 ? 'error' : 'primary'}
            sx={{ fontSize: '1.1rem', px: 2, py: 3 }}
          />
        )}
      </Box>

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            السؤال {currentQuestion + 1} من {questions.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            تم الإجابة على {getAnsweredCount()} من {questions.length}
          </Typography>
        </Box>
        <LinearProgress variant="determinate" value={getProgress()} sx={{ height: 8, borderRadius: 4 }} />
      </Box>

      {submitError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setSubmitError(null)}>
          {submitError}
        </Alert>
      )}

      {question && (
        <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Chip
              label={`${question.points || 1} نقطة`}
              size="small"
              color="primary"
              sx={{ mr: 2 }}
            />
            {isQuestionAnswered(question.id) && (
              <CheckCircleIcon color="success" fontSize="small" />
            )}
          </Box>

          <Typography variant="h6" sx={{ mb: 3, fontWeight: 'medium' }}>
            {question.question}
          </Typography>

          {question.type === 'MULTIPLE_CHOICE' && (
            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              >
                {question.options?.map((option, index) => (
                  <Card
                    key={index}
                    sx={{
                      mb: 2,
                      border: answers[question.id] === option ? 2 : 1,
                      borderColor: answers[question.id] === option ? 'primary.main' : 'divider',
                      cursor: 'pointer',
                      '&:hover': { borderColor: 'primary.main' },
                    }}
                    onClick={() => handleAnswerChange(question.id, option)}
                  >
                    <CardContent>
                      <FormControlLabel
                        value={option}
                        control={<Radio />}
                        label={option}
                        sx={{ width: '100%', m: 0 }}
                      />
                    </CardContent>
                  </Card>
                ))}
              </RadioGroup>
            </FormControl>
          )}

          {question.type === 'TRUE_FALSE' && (
            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              >
                <Card
                  sx={{
                    mb: 2,
                    border: answers[question.id] === 'true' ? 2 : 1,
                    borderColor: answers[question.id] === 'true' ? 'primary.main' : 'divider',
                    cursor: 'pointer',
                    '&:hover': { borderColor: 'primary.main' },
                  }}
                  onClick={() => handleAnswerChange(question.id, 'true')}
                >
                  <CardContent>
                    <FormControlLabel
                      value="true"
                      control={<Radio />}
                      label="صح"
                      sx={{ width: '100%', m: 0 }}
                    />
                  </CardContent>
                </Card>
                <Card
                  sx={{
                    border: answers[question.id] === 'false' ? 2 : 1,
                    borderColor: answers[question.id] === 'false' ? 'primary.main' : 'divider',
                    cursor: 'pointer',
                    '&:hover': { borderColor: 'primary.main' },
                  }}
                  onClick={() => handleAnswerChange(question.id, 'false')}
                >
                  <CardContent>
                    <FormControlLabel
                      value="false"
                      control={<Radio />}
                      label="خطأ"
                      sx={{ width: '100%', m: 0 }}
                    />
                  </CardContent>
                </Card>
              </RadioGroup>
            </FormControl>
          )}

          {(question.type === 'SHORT_ANSWER' || question.type === 'ESSAY') && (
            <TextField
              fullWidth
              multiline={question.type === 'ESSAY'}
              rows={question.type === 'ESSAY' ? 6 : 1}
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder="اكتب إجابتك هنا..."
              variant="outlined"
            />
          )}
        </Paper>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
        <Button
          variant="outlined"
          size="large"
          onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
        >
          السؤال السابق
        </Button>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {currentQuestion < questions.length - 1 ? (
            <Button
              variant="contained"
              size="large"
              onClick={() => setCurrentQuestion((prev) => Math.min(questions.length - 1, prev + 1))}
            >
              السؤال التالي
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              size="large"
              onClick={() => setShowSubmitDialog(true)}
              disabled={isSubmitting}
            >
              إرسال الإجابات
            </Button>
          )}
        </Box>
      </Box>

      <Dialog
        open={showSubmitDialog}
        onClose={() => setShowSubmitDialog(false)}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          تأكيد إرسال الاختبار
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            هل أنت متأكد أنك تريد إرسال إجاباتك؟
          </Typography>
          <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
            <Typography variant="body2">
              إجمالي الأسئلة: {questions.length}
            </Typography>
            <Typography variant="body2">
              تمت الإجابة: {getAnsweredCount()}
            </Typography>
            <Typography variant="body2">
              لم تتم الإجابة: {questions.length - getAnsweredCount()}
            </Typography>
          </Box>
          {getAnsweredCount() < questions.length && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              لم تجب على جميع الأسئلة. الأسئلة التي لم تجب عليها ستحتسب خاطئة.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSubmitDialog(false)}>
            إلغاء
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            نعم، إرسال الإجابات
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default QuizTake;
