import { Box, Container, Grid, Typography, Card, CardContent, Avatar } from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { useGetMeQuery } from '../../store/api/authApi';

const AdminDashboard = () => {
  const { data: userData } = useGetMeQuery();
  const user = userData?.data || userData;

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
                  bgcolor: 'error.main',
                  fontSize: '2rem',
                }}
              >
                {user?.full_name?.charAt(0) || 'A'}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                مرحباً، {user?.full_name || 'المسؤول'}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                لوحة تحكم المسؤول
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
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
                    <PeopleIcon sx={{ color: 'primary.main' }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      0
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      المستخدمون
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
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
                    <SchoolIcon sx={{ color: 'secondary.main' }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      0
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      الدورات
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
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
                    <AssessmentIcon sx={{ color: 'info.main' }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      0
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      الاختبارات
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
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
                    <TrendingIcon sx={{ color: 'success.main' }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      0%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      معدل النشاط
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                لوحة تحكم المسؤول
              </Typography>
              <Typography variant="body2" color="text.secondary">
                إدارة كاملة للنظام
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
