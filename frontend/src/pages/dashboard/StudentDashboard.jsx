import { Box, Container, Grid, Typography, Card, CardContent, Button, Avatar, LinearProgress, Chip } from '@mui/material';
import {
  School as SchoolIcon,
  LibraryBooks as BooksIcon,
  TrendingUp as TrendingIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import { useGetMeQuery } from '../../store/api/authApi';
import { useGetMyCoursesQuery } from '../../store/api/coursesApi';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
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
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                }}
              >
                {user?.full_name?.charAt(0) || 'P'}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                مرحباً، {user?.full_name || 'الطالب'}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                استمر في رحلتك التعليمية
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
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
                      الدورات المسجلة
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      bgcolor: 'secondary.light',
                      borderRadius: 2,
                      p: 1,
                      mr: 2,
                    }}
                  >
                    <BooksIcon sx={{ color: 'secondary.main' }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      0
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      الدروس المكتملة
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
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
                    <TrendingIcon sx={{ color: 'info.main' }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      0%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      معدل التقدم
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      bgcolor: 'warning.light',
                      borderRadius: 2,
                      p: 1,
                      mr: 2,
                    }}
                  >
                    <TrophyIcon sx={{ color: 'warning.main' }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      0
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      الشهادات
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              دوراتي
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/courses')}
            >
              تصفح الدورات
            </Button>
          </Box>

          {courses.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <SchoolIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  لم تسجل في أي دورة بعد
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  ابدأ رحلتك التعليمية بالتسجيل في دورة
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/courses')}
                >
                  استكشف الدورات
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
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            التقدم
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {course.progress || 0}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={course.progress || 0}
                          sx={{ height: 8, borderRadius: 1 }}
                        />
                      </Box>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => navigate(`/courses/${course.id}`)}
                      >
                        متابعة التعلم
                      </Button>
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

export default StudentDashboard;
