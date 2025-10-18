import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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
  IconButton,
  Alert,
  LinearProgress,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  VideoLibrary as VideoIcon,
  SignLanguage as SignLanguageIcon,
  Subtitles as SubtitlesIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import {
  useGetLessonByIdQuery,
  useCreateLessonMutation,
  useUpdateLessonMutation,
} from '../../store/api/lessonsApi';

const LESSON_TYPES = [
  { value: 'VIDEO', label: 'فيديو' },
  { value: 'TEXT', label: 'نص' },
  { value: 'QUIZ', label: 'اختبار' },
  { value: 'ASSIGNMENT', label: 'واجب' },
];

function LessonForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');
  const isEditMode = Boolean(id);

  const { data: lessonData, isLoading } = useGetLessonByIdQuery(id, { skip: !isEditMode });
  const [createLesson, { isLoading: isCreating }] = useCreateLessonMutation();
  const [updateLesson, { isLoading: isUpdating }] = useUpdateLessonMutation();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: courseId || '',
    type: 'VIDEO',
    order: 1,
    content: '',
    videoUrl: '',
    videoDuration: 0,
    signLanguageVideoUrl: '',
    captionsUrl: '',
    transcript: '',
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (lessonData?.data) {
      const lesson = lessonData.data;
      setFormData({
        title: lesson.title || '',
        description: lesson.description || '',
        courseId: lesson.courseId || courseId || '',
        type: lesson.type || 'VIDEO',
        order: lesson.order || 1,
        content: lesson.content || '',
        videoUrl: lesson.videoUrl || '',
        videoDuration: lesson.videoDuration || 0,
        signLanguageVideoUrl: lesson.signLanguageVideoUrl || '',
        captionsUrl: lesson.captionsUrl || '',
        transcript: lesson.transcript || '',
      });
    }
  }, [lessonData, courseId]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.title.trim()) {
      setError('يرجى إدخال عنوان الدرس');
      return;
    }

    if (!formData.courseId) {
      setError('يرجى تحديد الدورة');
      return;
    }

    if (formData.type === 'VIDEO' && !formData.videoUrl.trim()) {
      setError('يرجى إدخال رابط الفيديو');
      return;
    }

    try {
      if (isEditMode) {
        await updateLesson({ id, ...formData }).unwrap();
        setSuccess('تم تحديث الدرس بنجاح');
      } else {
        const result = await createLesson(formData).unwrap();
        setSuccess('تم إنشاء الدرس بنجاح');
        setTimeout(() => {
          navigate(`/lessons/${result.data.id}`);
        }, 1500);
      }
    } catch (err) {
      setError(err.data?.message || 'فشل في حفظ الدرس');
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate(-1)}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight="bold">
          {isEditMode ? 'تعديل الدرس' : 'إنشاء درس جديد'}
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

      <Paper elevation={3} sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                معلومات الدرس الأساسية
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="عنوان الدرس *"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="مثال: مقدمة في JavaScript"
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="وصف الدرس"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="اكتب وصفاً مختصراً للدرس..."
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>نوع الدرس</InputLabel>
                <Select
                  value={formData.type}
                  label="نوع الدرس"
                  onChange={(e) => handleChange('type', e.target.value)}
                >
                  {LESSON_TYPES.map((type) => (
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
                label="ترتيب الدرس"
                value={formData.order}
                onChange={(e) => handleChange('order', parseInt(e.target.value) || 1)}
                inputProps={{ min: 1 }}
                helperText="رقم ترتيب الدرس في الدورة"
              />
            </Grid>

            {formData.type === 'VIDEO' && (
              <>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, mt: 2 }}>
                    <VideoIcon color="primary" />
                    <Typography variant="h6">
                      محتوى الفيديو
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="رابط الفيديو الأساسي *"
                    value={formData.videoUrl}
                    onChange={(e) => handleChange('videoUrl', e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    required
                    helperText="رابط الفيديو من YouTube أو Vimeo أو أي منصة أخرى"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="مدة الفيديو (بالثواني)"
                    value={formData.videoDuration}
                    onChange={(e) => handleChange('videoDuration', parseInt(e.target.value) || 0)}
                    inputProps={{ min: 0 }}
                    helperText="مدة الفيديو بالثواني لتتبع التقدم"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, mt: 2 }}>
                    <SignLanguageIcon color="secondary" />
                    <Typography variant="h6" color="secondary">
                      دعم لغة الإشارة (للصم)
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Alert severity="info" icon={<SignLanguageIcon />} sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight="bold" gutterBottom>
                      ميزة دعم الصم
                    </Typography>
                    <Typography variant="body2">
                      يمكنك إضافة فيديو بلغة الإشارة ليتم عرضه جنباً إلى جنب مع الفيديو الأساسي للطلاب الصم
                    </Typography>
                  </Alert>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="رابط فيديو لغة الإشارة"
                    value={formData.signLanguageVideoUrl}
                    onChange={(e) => handleChange('signLanguageVideoUrl', e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    helperText="فيديو بلغة الإشارة (اختياري)"
                    InputProps={{
                      startAdornment: <SignLanguageIcon color="action" sx={{ mr: 1 }} />,
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, mt: 2 }}>
                    <SubtitlesIcon color="info" />
                    <Typography variant="h6">
                      الترجمة والنصوص
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="رابط ملف الترجمة (Captions)"
                    value={formData.captionsUrl}
                    onChange={(e) => handleChange('captionsUrl', e.target.value)}
                    placeholder="https://example.com/captions.vtt"
                    helperText="ملف WebVTT أو SRT للترجمة (اختياري)"
                    InputProps={{
                      startAdornment: <SubtitlesIcon color="action" sx={{ mr: 1 }} />,
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    label="النص الكامل للدرس (Transcript)"
                    value={formData.transcript}
                    onChange={(e) => handleChange('transcript', e.target.value)}
                    placeholder="النص الكامل لمحتوى الفيديو..."
                    helperText="النص المكتوب لمحتوى الفيديو يساعد في إمكانية الوصول والبحث"
                    InputProps={{
                      startAdornment: <DescriptionIcon color="action" sx={{ mr: 1, alignSelf: 'flex-start', mt: 1 }} />,
                    }}
                  />
                </Grid>
              </>
            )}

            {formData.type === 'TEXT' && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    محتوى الدرس النصي
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={10}
                    label="المحتوى *"
                    value={formData.content}
                    onChange={(e) => handleChange('content', e.target.value)}
                    placeholder="اكتب محتوى الدرس هنا... يمكنك استخدام Markdown"
                    required
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <Card sx={{ bgcolor: 'grey.50' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>ملاحظة:</strong> التسلسل الصارم للدروس
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • الطالب لن يستطيع الوصول لهذا الدرس حتى يكمل جميع الدروس السابقة
                    <br />
                    • يمكن للطالب فتح الدرس التالي فقط بعد إكمال هذا الدرس بنجاح
                    <br />
                    • الاختبارات يجب اجتيازها للانتقال للدرس التالي
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(-1)}
                  disabled={isCreating || isUpdating}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={isCreating || isUpdating}
                >
                  {isCreating || isUpdating
                    ? 'جاري الحفظ...'
                    : isEditMode
                    ? 'حفظ التغييرات'
                    : 'إنشاء الدرس'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}

export default LessonForm;
