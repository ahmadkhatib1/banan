import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Avatar,
} from '@mui/material';
import {
  PlayCircle as PlayIcon,
  Lock as LockIcon,
  CheckCircle as CheckIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useGetCourseByIdQuery, useEnrollInCourseMutation } from '../../store/api/coursesApi';
import { useGetCourseLessonsQuery } from '../../store/api/coursesApi';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: courseData, isLoading } = useGetCourseByIdQuery(id);
  const { data: lessonsData } = useGetCourseLessonsQuery(id);
  const [enrollInCourse, { isLoading: isEnrolling }] = useEnrollInCourseMutation();

  const course = courseData?.data || courseData;
  const lessons = lessonsData?.data || lessonsData || [];

  const handleEnroll = async () => {
    try {
      await enrollInCourse(id).unwrap();
      alert('تم التسجيل في الدورة بنجاح!');
    } catch (error) {
      alert('فشل التسجيل في الدورة');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>جاري التحميل...</Typography>
      </Box>
    );
  }

  if (!course) {
    return (
      <Container>
        <Typography variant="h5" sx={{ mt: 4 }}>
          الدورة غير موجودة
        </Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Card sx={{ mb: 3 }}>
              {course.image_url ? (
                <Box
                  component="img"
                  src={course.image_url}
                  alt={course.title}
                  sx={{ width: '100%', height: 400, objectFit: 'cover' }}
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: 400,
                    bgcolor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PlayIcon sx={{ fontSize: 120, color: 'white' }} />
                </Box>
              )}

              <CardContent>
                <Box sx={{ mb: 2 }}>
                  {course.level && (
                    <Chip label={course.level} color="primary" sx={{ mr: 1 }} />
                  )}
                  {course.status === 'PUBLISHED' && (
                    <Chip label="منشور" color="success" />
                  )}
                </Box>

                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  {course.title}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ width: 40, height: 40, mr: 2 }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      المدرب
                    </Typography>
                    <Typography variant="body1" fontWeight="600">
                      {course.instructor_name || 'مدرب'}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body1" paragraph>
                  {course.description}
                </Typography>

                {course.long_description && (
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {course.long_description}
                  </Typography>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  محتوى الدورة
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {lessons.length} درس
                </Typography>

                <List>
                  {lessons.map((lesson, index) => (
                    <Box key={lesson.id}>
                      <ListItem disablePadding>
                        <ListItemButton
                          onClick={() => navigate(`/lessons/${lesson.id}`)}
                        >
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              bgcolor: 'primary.light',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mr: 2,
                            }}
                          >
                            {lesson.is_completed ? (
                              <CheckIcon sx={{ color: 'success.main' }} />
                            ) : lesson.is_locked ? (
                              <LockIcon sx={{ color: 'text.disabled' }} />
                            ) : (
                              <PlayIcon sx={{ color: 'primary.main' }} />
                            )}
                          </Box>
                          <ListItemText
                            primary={`${index + 1}. ${lesson.title}`}
                            secondary={lesson.duration ? `${lesson.duration} دقيقة` : ''}
                          />
                        </ListItemButton>
                      </ListItem>
                      {index < lessons.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ position: 'sticky', top: 16 }}>
              <CardContent>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  التسجيل في الدورة
                </Typography>

                <Box sx={{ my: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    السعر
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {course.price ? `${course.price} ريال` : 'مجاني'}
                  </Typography>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleEnroll}
                  disabled={isEnrolling}
                  sx={{ mb: 2 }}
                >
                  {isEnrolling ? 'جاري التسجيل...' : 'سجل الآن'}
                </Button>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
                  ابدأ التعلم فوراً بعد التسجيل
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CourseDetails;
