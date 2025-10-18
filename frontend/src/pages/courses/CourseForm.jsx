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
  IconButton,
  Alert,
  LinearProgress,
  Chip,
  Card,
  CardMedia,
  CardContent,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  CloudUpload as UploadIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import {
  useGetCourseByIdQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
} from '../../store/api/coursesApi';

const COURSE_LEVELS = [
  { value: 'BEGINNER', label: 'مبتدئ' },
  { value: 'INTERMEDIATE', label: 'متوسط' },
  { value: 'ADVANCED', label: 'متقدم' },
];

const COURSE_CATEGORIES = [
  'البرمجة',
  'التصميم',
  'الأعمال',
  'التسويق',
  'اللغات',
  'العلوم',
  'الرياضيات',
  'الفنون',
  'أخرى',
];

function CourseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const { data: courseData, isLoading } = useGetCourseByIdQuery(id, { skip: !isEditMode });
  const [createCourse, { isLoading: isCreating }] = useCreateCourseMutation();
  const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'BEGINNER',
    category: '',
    price: 0,
    thumbnail: '',
    tags: [],
  });

  const [tagInput, setTagInput] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (courseData?.data) {
      const course = courseData.data;
      setFormData({
        title: course.title || '',
        description: course.description || '',
        level: course.level || 'BEGINNER',
        category: course.category || '',
        price: course.price || 0,
        thumbnail: course.thumbnail || '',
        tags: course.tags || [],
      });
      setThumbnailPreview(course.thumbnail || '');
    }
  }, [courseData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.title.trim()) {
      setError('يرجى إدخال عنوان الدورة');
      return;
    }

    if (!formData.description.trim()) {
      setError('يرجى إدخال وصف الدورة');
      return;
    }

    if (!formData.category) {
      setError('يرجى اختيار فئة الدورة');
      return;
    }

    try {
      if (isEditMode) {
        await updateCourse({ id, ...formData }).unwrap();
        setSuccess('تم تحديث الدورة بنجاح');
      } else {
        const result = await createCourse(formData).unwrap();
        setSuccess('تم إنشاء الدورة بنجاح');
        setTimeout(() => {
          navigate(`/courses/${result.data.id}`);
        }, 1500);
      }
    } catch (err) {
      setError(err.data?.message || 'فشل في حفظ الدورة');
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
          {isEditMode ? 'تعديل الدورة' : 'إنشاء دورة جديدة'}
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
              <TextField
                fullWidth
                label="عنوان الدورة *"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="مثال: دورة كاملة في تطوير الويب"
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="وصف الدورة *"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="اكتب وصفاً شاملاً للدورة وما سيتعلمه الطلاب..."
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>المستوى</InputLabel>
                <Select
                  value={formData.level}
                  label="المستوى"
                  onChange={(e) => handleChange('level', e.target.value)}
                >
                  {COURSE_LEVELS.map((level) => (
                    <MenuItem key={level.value} value={level.value}>
                      {level.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>الفئة</InputLabel>
                <Select
                  value={formData.category}
                  label="الفئة"
                  onChange={(e) => handleChange('category', e.target.value)}
                >
                  {COURSE_CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="السعر (اختياري)"
                value={formData.price}
                onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                helperText="اتركه 0 للدورات المجانية"
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="رابط صورة الدورة"
                value={formData.thumbnail}
                onChange={(e) => {
                  handleChange('thumbnail', e.target.value);
                  setThumbnailPreview(e.target.value);
                }}
                placeholder="https://example.com/image.jpg"
                helperText="أدخل رابط صورة من الإنترنت"
              />
            </Grid>

            {thumbnailPreview && (
              <Grid item xs={12}>
                <Card>
                  <CardMedia
                    component="img"
                    height="200"
                    image={thumbnailPreview}
                    alt="معاينة الصورة"
                    sx={{ objectFit: 'cover' }}
                    onError={() => setThumbnailPreview('')}
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      معاينة صورة الدورة
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                الوسوم (Tags)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                {formData.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="أضف وسم جديد"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button variant="outlined" onClick={handleAddTag}>
                  إضافة
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
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
                    : 'إنشاء الدورة'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {isEditMode && (
        <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            إدارة محتوى الدورة
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            بعد حفظ الدورة، يمكنك إضافة الدروس والاختبارات من صفحة تفاصيل الدورة
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate(`/courses/${id}`)}
          >
            عرض تفاصيل الدورة
          </Button>
        </Paper>
      )}
    </Container>
  );
}

export default CourseForm;
