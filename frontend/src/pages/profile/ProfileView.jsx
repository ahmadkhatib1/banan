import { Box, Container, Typography, Card, CardContent, Avatar, Grid, Chip, Button, Divider } from '@mui/material';
import { Edit as EditIcon, Email as EmailIcon, CalendarToday as CalendarIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useGetProfileQuery } from '../../store/api/authApi';
import { ProfileSkeleton } from '../../components/common/LoadingSkeleton';

const ProfileView = () => {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useGetProfileQuery();

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <ProfileSkeleton />
      </Container>
    );
  }

  if (!profile) {
    return null;
  }

  const roleColors = {
    STUDENT: 'primary',
    INSTRUCTOR: 'secondary',
    CONTENT_ADMIN: 'warning',
    SUPER_ADMIN: 'error',
  };

  const roleLabels = {
    STUDENT: 'طالب',
    INSTRUCTOR: 'مدرب',
    CONTENT_ADMIN: 'مدير محتوى',
    SUPER_ADMIN: 'مسؤول عام',
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={3} flexWrap="wrap">
            <Avatar
              src={profile.avatar || profile.profile_picture}
              alt={`${profile.first_name} ${profile.last_name}`}
              sx={{ width: 100, height: 100 }}
            >
              {profile.first_name[0]}{profile.last_name[0]}
            </Avatar>

            <Box flexGrow={1}>
              <Typography variant="h4" gutterBottom>
                {profile.first_name} {profile.last_name}
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip
                  label={roleLabels[profile.role]}
                  color={roleColors[profile.role]}
                  size="small"
                />
                {profile.is_email_verified && (
                  <Chip label="بريد موثق" color="success" size="small" variant="outlined" />
                )}
              </Box>
            </Box>

            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate('/profile/edit')}
            >
              تعديل الملف الشخصي
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                المعلومات الشخصية
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    البريد الإلكتروني
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                    <EmailIcon fontSize="small" color="action" />
                    <Typography variant="body1">{profile.email}</Typography>
                  </Box>
                </Grid>

                {profile.username && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      اسم المستخدم
                    </Typography>
                    <Typography variant="body1" mt={0.5}>
                      {profile.username}
                    </Typography>
                  </Grid>
                )}

                {profile.date_of_birth && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      تاريخ الميلاد
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                      <CalendarIcon fontSize="small" color="action" />
                      <Typography variant="body1">
                        {new Date(profile.date_of_birth).toLocaleDateString('ar')}
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {profile.grade && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      الصف الدراسي
                    </Typography>
                    <Typography variant="body1" mt={0.5}>
                      {profile.grade}
                    </Typography>
                  </Grid>
                )}

                {profile.parent_email && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      بريد ولي الأمر
                    </Typography>
                    <Typography variant="body1" mt={0.5}>
                      {profile.parent_email}
                    </Typography>
                  </Grid>
                )}

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    تاريخ التسجيل
                  </Typography>
                  <Typography variant="body1" mt={0.5}>
                    {new Date(profile.created_at).toLocaleDateString('ar')}
                  </Typography>
                </Grid>

                {profile.last_login_at && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      آخر تسجيل دخول
                    </Typography>
                    <Typography variant="body1" mt={0.5}>
                      {new Date(profile.last_login_at).toLocaleString('ar')}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                الإجراءات السريعة
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box display="flex" flexDirection="column" gap={2}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/profile/edit')}
                >
                  تعديل البيانات
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/profile/change-password')}
                >
                  تغيير كلمة المرور
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/profile/progress')}
                >
                  عرض التقدم
                </Button>
                {profile.role === 'STUDENT' && (
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/profile/certificates')}
                  >
                    شهاداتي
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>

          {profile.role === 'STUDENT' && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  الإحصائيات
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box display="flex" flexDirection="column" gap={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      الدورات المسجلة
                    </Typography>
                    <Typography variant="h5" color="primary">
                      {profile.enrolled_courses_count || 0}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      الدورات المكتملة
                    </Typography>
                    <Typography variant="h5" color="success.main">
                      {profile.completed_courses_count || 0}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      الدروس المكتملة
                    </Typography>
                    <Typography variant="h5" color="secondary.main">
                      {profile.completed_lessons_count || 0}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfileView;
