import { Box, Container, Grid, Typography, Card, CardContent, Button, Avatar } from '@mui/material';
import {
  School as SchoolIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useGetMeQuery } from '../../store/api/authApi';
import { useGetMyCoursesQuery } from '../../store/api/coursesApi';
import { useNavigate } from 'react-router-dom';

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const { data: userData } = useGetMeQuery();
  const { data: coursesData } = useGetMyCoursesQuery();

  const user = userData?.data || userData;
  const courses = coursesData?.data || coursesData || [];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'secondary.main',
                  fontSize: '2rem',
                  color: 'text.primary',
                }}
              >
                {user?.full_name?.charAt(0) || 'I'}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                مرحباً، {user?.full_name || 'المدرب'}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                لوحة تحكم المدرب
              </Typography>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                size="large"
              >
                إنشاء دورة جديدة
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      bgcolor: 'primary.light',
                      borderRadius: 2,
                      p: 1,
                      mr: 2,
                    }}
                  >
                    <SchoolIcon sx={{ color: 'primary.main' }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {courses.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      دوراتي
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      bgcolor: 'info.light',
                      borderRadius: 2,
                      p: 1,
                      mr: 2,
                    }}
                  >
                    <PeopleIcon sx={{ color: 'info.main' }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      0
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      الطلاب
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      bgcolor: 'success.light',
                      borderRadius: 2,
                      p: 1,
                      mr: 2,
                    }}
                  >
                    <AssessmentIcon sx={{ color: 'success.main' }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      0%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      معدل الإكمال
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
            دوراتي
          </Typography>

          {courses.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <SchoolIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  لم تقم بإنشاء أي دورة بعد
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  ابدأ بإنشاء دورتك الأولى ومشاركة معرفتك
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />}>
                  إنشاء دورة جديدة
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {courses.map((course) => (
                <Grid item xs={12} md={6} key={course.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {course.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {course.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          onClick={() => navigate(`/courses/${course.id}`)}
                        >
                          عرض
                        </Button>
                        <Button variant="text">تعديل</Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default InstructorDashboard;
