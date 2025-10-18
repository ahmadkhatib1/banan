import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Alert,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateLessonMutation } from '../../store/api/lessonsApi';

const CreateLesson = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [createLesson, { isLoading, error }] = useCreateLessonMutation();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    type: 'VIDEO',
    duration: 0,
    order_index: 1,
    video_url: '',
    video_thumbnail: '',
    captions_url: '',
    sign_language_video_url: '',
    transcript: '',
    materials: '',
    is_preview: false,
  });

  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: e.target.type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);

    try {
      const lessonData = {
        ...formData,
        course_id: courseId,
      };

      await createLesson(lessonData).unwrap();
      setSuccess(true);
      setTimeout(() => {
        navigate(`/courses/${courseId}`);
      }, 1500);
    } catch (err) {
      console.error('Failed to create lesson:', err);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        إضافة درس جديد
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        أضف درساً جديداً للدورة مع دعم إمكانية الوصول
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          تم إنشاء الدرس بنجاح! جاري التحويل...
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          فشل في إنشاء الدرس. يرجى المحاولة مرة أخرى.
        </Alert>
      )}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="عنوان الدرس"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="مثال: مقدمة في المتغيرات"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="وصف الدرس"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  required
                  label="نوع الدرس"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <MenuItem value="VIDEO">فيديو</MenuItem>
                  <MenuItem value="INTERACTIVE">تفاعلي</MenuItem>
                  <MenuItem value="QUIZ">اختبار</MenuItem>
                  <MenuItem value="ASSIGNMENT">واجب</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  type="number"
                  required
                  label="الترتيب"
                  name="order_index"
                  value={formData.order_index}
                  onChange={handleChange}
                  helperText="ترتيب الدرس"
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="المدة (دقيقة)"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                />
              </Grid>

              {formData.type === 'VIDEO' && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      label="رابط الفيديو"
                      name="video_url"
                      value={formData.video_url}
                      onChange={handleChange}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="رابط الصورة المصغرة"
                      name="video_thumbnail"
                      value={formData.video_thumbnail}
                      onChange={handleChange}
                      placeholder="https://example.com/thumbnail.jpg"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      إمكانية الوصول
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      أضف ميزات لدعم ذوي الاحتياجات الخاصة
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="رابط ملف الترجمة (WebVTT/SRT)"
                      name="captions_url"
                      value={formData.captions_url}
                      onChange={handleChange}
                      placeholder="https://example.com/captions.vtt"
                      helperText="ملف ترجمة نصية للفيديو"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="رابط فيديو لغة الإشارة"
                      name="sign_language_video_url"
                      value={formData.sign_language_video_url}
                      onChange={handleChange}
                      placeholder="https://example.com/sign-language.mp4"
                      helperText="فيديو مترجم بلغة الإشارة للصم"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="النص الكامل (Transcript)"
                      name="transcript"
                      value={formData.transcript}
                      onChange={handleChange}
                      multiline
                      rows={4}
                      helperText="النص المكتوب للدرس كاملاً"
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="المحتوى النصي"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  multiline
                  rows={6}
                  helperText="محتوى الدرس (نص، روابط، إلخ)"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="المواد الإضافية"
                  name="materials"
                  value={formData.materials}
                  onChange={handleChange}
                  placeholder="https://example.com/file1.pdf, https://example.com/file2.zip"
                  helperText="روابط الملفات الإضافية (افصل بفاصلة)"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_preview}
                      onChange={handleChange}
                      name="is_preview"
                    />
                  }
                  label="درس معاينة مجاني (متاح للجميع)"
                />
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" gap={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={() => navigate(`/courses/${courseId}`)}
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={isLoading}
                  >
                    {isLoading ? 'جاري الحفظ...' : 'حفظ الدرس'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CreateLesson;
