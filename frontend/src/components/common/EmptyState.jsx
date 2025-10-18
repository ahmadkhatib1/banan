import { Box, Typography, Button } from '@mui/material';
import {
  Inbox as InboxIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';

const iconMap = {
  courses: SchoolIcon,
  lessons: AssignmentIcon,
  achievements: TrophyIcon,
  default: InboxIcon,
};

const EmptyState = ({
  type = 'default',
  title,
  description,
  action,
  actionLabel
}) => {
  const Icon = iconMap[type] || InboxIcon;

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="300px"
      textAlign="center"
      p={4}
    >
      <Icon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h5" gutterBottom>
        {title || 'لا توجد بيانات'}
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {description || 'لا توجد عناصر لعرضها حالياً'}
      </Typography>
      {action && actionLabel && (
        <Button variant="contained" onClick={action} sx={{ mt: 2 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
