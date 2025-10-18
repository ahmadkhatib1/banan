import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  IconButton,
  Divider,
  Alert,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  ArrowBack as BackIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';
import {
  useGetQuizByIdQuery,
  useCreateQuizMutation,
  useUpdateQuizMutation,
  useAddQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
} from '../../store/api/quizzesApi';

const QUESTION_TYPES = [
  { value: 'MULTIPLE_CHOICE', label: 'اختيار من متعدد' },
  { value: 'TRUE_FALSE', label: 'صح أو خطأ' },
  { value: 'SHORT_ANSWER', label: 'إجابة قصيرة' },
  { value: 'ESSAY', label: 'مقالي' },
];

function QuizForm() {
  const { id, courseId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const { data: quizData, isLoading } = useGetQuizByIdQuery(id, { skip: !isEditMode });
  const [createQuiz, { isLoading: isCreating }] = useCreateQuizMutation();
  const [updateQuiz, { isLoading: isUpdating }] = useUpdateQuizMutation();
  const [addQuestion] = useAddQuestionMutation();
  const [updateQuestion] = useUpdateQuestionMutation();
  const [deleteQuestion] = useDeleteQuestionMutation();

  const [quizInfo, setQuizInfo] = useState({
    title: '',
    description: '',
    courseId: courseId || '',
    lessonId: '',
    timeLimit: '',
    passingScore: 50,
    maxAttempts: '',
    isRandomized: false,
    showResults: true,
    published: false,
  });

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (quizData?.data) {
      const quiz = quizData.data;
      setQuizInfo({
        title: quiz.title || '',
        description: quiz.description || '',
        courseId: quiz.courseId || courseId || '',
        lessonId: quiz.lessonId || '',
        timeLimit: quiz.timeLimit || '',
        passingScore: quiz.passingScore || 50,
        maxAttempts: quiz.maxAttempts || '',
        isRandomized: quiz.isRandomized || false,
        showResults: quiz.showResults ?? true,
        published: quiz.published || false,
      });
      setQuestions(quiz.questions || []);
    }
  }, [quizData, courseId]);

  const handleQuizInfoChange = (field, value) => {
    setQuizInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveQuiz = async () => {
    setError(null);
    setSuccess(null);

    if (!quizInfo.title.trim()) {
      setError('يرجى إدخال عنوان الاختبار');
      return;
    }

    try {
      if (isEditMode) {
        await updateQuiz({ id, ...quizInfo }).unwrap();
        setSuccess('تم تحديث الاختبار بنجاح');
      } else {
        const result = await createQuiz(quizInfo).unwrap();
        setSuccess('تم إنشاء الاختبار بنجاح');
        navigate(`/quizzes/${result.data.id}/edit`);
      }
    } catch (err) {
      setError(err.data?.message || 'فشل في حفظ الاختبار');
    }
  };

  const handleOpenQuestionDialog = (question = null) => {
    if (question) {
      setCurrentQuestion({ ...question });
    } else {
      setCurrentQuestion({
        question: '',
        type: 'MULTIPLE_CHOICE',
        points: 1,
        order: questions.length + 1,
        options: ['', '', '', ''],
        correctAnswer: '',
        explanation: '',
      });
    }
    setShowQuestionDialog(true);
  };

  const handleCloseQuestionDialog = () => {
    setCurrentQuestion(null);
    setShowQuestionDialog(false);
  };

  const handleQuestionChange = (field, value) => {
    setCurrentQuestion((prev) => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion((prev) => ({ ...prev, options: newOptions }));
  };

  const handleAddOption = () => {
    setCurrentQuestion((prev) => ({
      ...prev,
      options: [...prev.options, ''],
    }));
  };

  const handleRemoveOption = (index) => {
    const newOptions = currentQuestion.options.filter((_, i) => i !== index);
    setCurrentQuestion((prev) => ({ ...prev, options: newOptions }));
  };

  const handleSaveQuestion = async () => {
    if (!currentQuestion.question.trim()) {
      setError('يرجى إدخال نص السؤال');
      return;
    }

    if (currentQuestion.type === 'MULTIPLE_CHOICE' && currentQuestion.options.length < 2) {
      setError('يجب أن يكون هناك خياران على الأقل');
      return;
    }

    try {
      if (currentQuestion.id) {
        await updateQuestion({
          quizId: id,
          questionId: currentQuestion.id,
          ...currentQuestion,
        }).unwrap();
        setQuestions((prev) =>
          prev.map((q) => (q.id === currentQuestion.id ? currentQuestion : q))
        );
      } else {
        const result = await addQuestion({
          quizId: id,
          ...currentQuestion,
        }).unwrap();
        setQuestions((prev) => [...prev, result.data]);
      }
      handleCloseQuestionDialog();
      setSuccess('تم حفظ السؤال بنجاح');
    } catch (err) {
      setError(err.data?.message || 'فشل في حفظ السؤال');
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا السؤال؟')) return;

    try {
      await deleteQuestion({ quizId: id, questionId }).unwrap();
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      setSuccess('تم حذف السؤال بنجاح');
    } catch (err) {
      setError(err.data?.message || 'فشل في حذف السؤال');
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate(-1)}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight="bold">
          {isEditMode ? 'تعديل الاختبار' : 'إنشاء اختبار جديد'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          معلومات الاختبار
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="عنوان الاختبار"
              value={quizInfo.title}
              onChange={(e) => handleQuizInfoChange('title', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="الوصف"
              value={quizInfo.description}
              onChange={(e) => handleQuizInfoChange('description', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="number"
              label="الوقت المحدد (دقيقة)"
              value={quizInfo.timeLimit}
              onChange={(e) => handleQuizInfoChange('timeLimit', e.target.value)}
              helperText="اتركه فارغاً إذا لم يكن محدداً"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="number"
              label="نسبة النجاح (%)"
              value={quizInfo.passingScore}
              onChange={(e) => handleQuizInfoChange('passingScore', e.target.value)}
              inputProps={{ min: 0, max: 100 }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="number"
              label="عدد المحاولات المسموحة"
              value={quizInfo.maxAttempts}
              onChange={(e) => handleQuizInfoChange('maxAttempts', e.target.value)}
              helperText="اتركه فارغاً لمحاولات غير محدودة"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={quizInfo.isRandomized}
                  onChange={(e) => handleQuizInfoChange('isRandomized', e.target.checked)}
                />
              }
              label="ترتيب الأسئلة عشوائياً"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={quizInfo.showResults}
                  onChange={(e) => handleQuizInfoChange('showResults', e.target.checked)}
                />
              }
              label="إظهار النتائج للطلاب"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={quizInfo.published}
                  onChange={(e) => handleQuizInfoChange('published', e.target.checked)}
                />
              }
              label="نشر الاختبار"
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveQuiz}
            disabled={isCreating || isUpdating}
          >
            حفظ الاختبار
          </Button>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            إلغاء
          </Button>
        </Box>
      </Paper>

      {isEditMode && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight="bold">
              الأسئلة ({questions.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenQuestionDialog()}
            >
              إضافة سؤال
            </Button>
          </Box>

          {questions.length === 0 ? (
            <Alert severity="info">لا توجد أسئلة. قم بإضافة أسئلة للاختبار.</Alert>
          ) : (
            <Grid container spacing={2}>
              {questions.map((question, index) => (
                <Grid item xs={12} key={question.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <DragIcon sx={{ color: 'text.disabled', mt: 1 }} />
                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Chip label={`سؤال ${index + 1}`} size="small" color="primary" />
                            <Chip
                              label={QUESTION_TYPES.find((t) => t.value === question.type)?.label}
                              size="small"
                              variant="outlined"
                            />
                            <Chip label={`${question.points || 1} نقطة`} size="small" variant="outlined" />
                          </Box>
                          <Typography variant="body1" fontWeight="medium">
                            {question.question}
                          </Typography>
                          {question.type === 'MULTIPLE_CHOICE' && question.options && (
                            <Box sx={{ mt: 1, ml: 2 }}>
                              {question.options.map((option, i) => (
                                <Typography
                                  key={i}
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    fontWeight: option === question.correctAnswer ? 'bold' : 'normal',
                                    color: option === question.correctAnswer ? 'success.main' : 'text.secondary',
                                  }}
                                >
                                  {i + 1}. {option}
                                </Typography>
                              ))}
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button size="small" onClick={() => handleOpenQuestionDialog(question)}>
                        تعديل
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleDeleteQuestion(question.id)}
                      >
                        حذف
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      )}

      <Dialog
        open={showQuestionDialog}
        onClose={handleCloseQuestionDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentQuestion?.id ? 'تعديل السؤال' : 'إضافة سؤال جديد'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="نص السؤال"
                  value={currentQuestion?.question || ''}
                  onChange={(e) => handleQuestionChange('question', e.target.value)}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>نوع السؤال</InputLabel>
                  <Select
                    value={currentQuestion?.type || 'MULTIPLE_CHOICE'}
                    label="نوع السؤال"
                    onChange={(e) => handleQuestionChange('type', e.target.value)}
                  >
                    {QUESTION_TYPES.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="النقاط"
                  value={currentQuestion?.points || 1}
                  onChange={(e) => handleQuestionChange('points', parseInt(e.target.value))}
                  inputProps={{ min: 1 }}
                />
              </Grid>

              {currentQuestion?.type === 'MULTIPLE_CHOICE' && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      الخيارات
                    </Typography>
                    {currentQuestion.options?.map((option, index) => (
                      <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder={`الخيار ${index + 1}`}
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                        />
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveOption(index)}
                          disabled={currentQuestion.options.length <= 2}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ))}
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={handleAddOption}
                    >
                      إضافة خيار
                    </Button>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>الإجابة الصحيحة</InputLabel>
                      <Select
                        value={currentQuestion?.correctAnswer || ''}
                        label="الإجابة الصحيحة"
                        onChange={(e) => handleQuestionChange('correctAnswer', e.target.value)}
                      >
                        {currentQuestion.options?.map((option, index) => (
                          <MenuItem key={index} value={option}>
                            {option || `الخيار ${index + 1}`}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}

              {currentQuestion?.type === 'TRUE_FALSE' && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>الإجابة الصحيحة</InputLabel>
                    <Select
                      value={currentQuestion?.correctAnswer || ''}
                      label="الإجابة الصحيحة"
                      onChange={(e) => handleQuestionChange('correctAnswer', e.target.value)}
                    >
                      <MenuItem value="true">صح</MenuItem>
                      <MenuItem value="false">خطأ</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="التوضيح (اختياري)"
                  value={currentQuestion?.explanation || ''}
                  onChange={(e) => handleQuestionChange('explanation', e.target.value)}
                  helperText="سيظهر للطلاب بعد الإجابة"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseQuestionDialog}>إلغاء</Button>
          <Button variant="contained" onClick={handleSaveQuestion}>
            حفظ السؤال
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default QuizForm;
