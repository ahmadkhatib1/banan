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
  Chip,
  InputAdornment,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCreateCourseMutation } from '../../store/api/coursesApi';

const CreateCourse = () => {
  const navigate = useNavigate();
  const [createCourse, { isLoading, error }] = useCreateCourseMutation();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    short_description: '',
    level: 'BEGINNER',
    price: 0,
    duration: 0,
    language: 'ar',
    thumbnail: '',
    cover_image: '',
    tags: '',
    requirements: '',
    objectives: '',
  });

  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);

    try {
      const result = await createCourse(formData).unwrap();
      setSuccess(true);
      setTimeout(() => {
        navigate(`/courses/${result.id}`);
      }, 1500);
    } catch (err) {
      console.error('Failed to create course:', err);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        إنشاء دورة جديدة
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        املأ النموذج التالي لإنشاء دورة تعليمية جديدة
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          تم إنشاء الدورة بنجاح! جاري التحويل...
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          فشل في إنشاء الدورة. يرجى المحاولة مرة أخرى.
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
                  label="عنوان الدورة"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="مثال: مقدمة في البرمجة بلغة Python"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="وصف مختصر"
                  name="short_description"
                  value={formData.short_description}
                  onChange={handleChange}
                  placeholder="وصف قصير يظهر في قائمة الدورات"
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="الوصف الكامل"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="وصف تفصيلي عن محتوى الدورة وما سيتعلمه الطالب"
                  multiline
                  rows={4}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  required
                  label="المستوى"
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                >
                  <MenuItem value="BEGINNER">مبتدئ</MenuItem>
                  <MenuItem value="INTERMEDIATE">متوسط</MenuItem>
                  <MenuItem value="ADVANCED">متقدم</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="اللغة"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                >
                  <MenuItem value="ar">العربية</MenuItem>
                  <MenuItem value="en">الإنجليزية</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="السعر"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  helperText="اترك 0 للدورات المجانية"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="المدة (بالدقائق)"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  helperText="المدة التقديرية للدورة"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="رابط الصورة المصغرة"
                  name="thumbnail"
                  value={formData.thumbnail}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  helperText="رابط صورة مصغرة للدورة"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="رابط صورة الغلاف"
                  name="cover_image"
                  value={formData.cover_image}
                  onChange={handleChange}
                  placeholder="https://example.com/cover.jpg"
                  helperText="رابط صورة غلاف كبيرة للدورة"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="الكلمات المفتاحية"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="برمجة, Python, تعليم"
                  helperText="افصل بين الكلمات بفاصلة"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="المتطلبات"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  placeholder="جهاز كمبيوتر, معرفة أساسية بالحاسوب"
                  multiline
                  rows={2}
                  helperText="ما يحتاجه الطالب قبل البدء بالدورة"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="الأهداف التعليمية"
                  name="objectives"
                  value={formData.objectives}
                  onChange={handleChange}
                  placeholder="فهم أساسيات البرمجة, كتابة برامج بسيطة"
                  multiline
                  rows={2}
                  helperText="ما سيتعلمه الطالب بنهاية الدورة"
                />
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" gap={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={() => navigate('/instructor/dashboard')}
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={isLoading}
                  >
                    {isLoading ? 'جاري الحفظ...' : 'حفظ الدورة'}
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

export default CreateCourse;
