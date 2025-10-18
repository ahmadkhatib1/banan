import { Box, Skeleton, Card, CardContent, Grid } from '@mui/material';

export const CourseCardSkeleton = () => (
  <Card>
    <Skeleton variant="rectangular" height={200} />
    <CardContent>
      <Skeleton variant="text" height={32} width="80%" />
      <Skeleton variant="text" height={20} width="60%" />
      <Box display="flex" gap={1} mt={2}>
        <Skeleton variant="rectangular" width={80} height={24} />
        <Skeleton variant="rectangular" width={80} height={24} />
      </Box>
    </CardContent>
  </Card>
);

export const LessonCardSkeleton = () => (
  <Card>
    <CardContent>
      <Box display="flex" alignItems="center" gap={2}>
        <Skeleton variant="circular" width={40} height={40} />
        <Box flexGrow={1}>
          <Skeleton variant="text" height={28} width="70%" />
          <Skeleton variant="text" height={20} width="50%" />
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export const DashboardSkeleton = () => (
  <Box>
    <Skeleton variant="text" height={48} width="40%" sx={{ mb: 2 }} />
    <Grid container spacing={3}>
      {[1, 2, 3, 4].map((i) => (
        <Grid item xs={12} sm={6} md={3} key={i}>
          <Card>
            <CardContent>
              <Skeleton variant="text" height={28} width="60%" />
              <Skeleton variant="text" height={40} width="40%" />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
    <Box mt={4}>
      <Skeleton variant="text" height={36} width="30%" sx={{ mb: 2 }} />
      <Grid container spacing={3}>
        {[1, 2, 3].map((i) => (
          <Grid item xs={12} md={4} key={i}>
            <CourseCardSkeleton />
          </Grid>
        ))}
      </Grid>
    </Box>
  </Box>
);

export const ProfileSkeleton = () => (
  <Box>
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={3}>
          <Skeleton variant="circular" width={100} height={100} />
          <Box flexGrow={1}>
            <Skeleton variant="text" height={36} width="40%" />
            <Skeleton variant="text" height={24} width="60%" />
          </Box>
        </Box>
      </CardContent>
    </Card>
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Skeleton variant="text" height={32} width="30%" sx={{ mb: 2 }} />
            {[1, 2, 3, 4].map((i) => (
              <Box key={i} mb={2}>
                <Skeleton variant="text" height={24} width="20%" />
                <Skeleton variant="text" height={40} width="100%" />
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Skeleton variant="text" height={32} width="60%" sx={{ mb: 2 }} />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="text" height={24} sx={{ mb: 1 }} />
            ))}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </Box>
);
