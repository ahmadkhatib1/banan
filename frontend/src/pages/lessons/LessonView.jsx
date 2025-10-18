import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import {
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  CheckCircle as CheckIcon,
  SignLanguage as SignLanguageIcon,
  Subtitles as SubtitlesIcon,
} from '@mui/icons-material';
import {
  useGetLessonByIdQuery,
  useCompleteLessonMutation,
  useGetNextLessonQuery,
  useGetPreviousLessonQuery,
} from '../../store/api/lessonsApi';

const LessonView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: lessonData, isLoading } = useGetLessonByIdQuery(id);
  const { data: nextLessonData } = useGetNextLessonQuery(id);
  const { data: prevLessonData } = useGetPreviousLessonQuery(id);
  const [completeLesson, { isLoading: isCompleting }] = useCompleteLessonMutation();

  const [activeTab, setActiveTab] = useState(0);
  const [showSignLanguage, setShowSignLanguage] = useState(false);

  const lesson = lessonData?.data || lessonData;
  const nextLesson = nextLessonData?.data?.nextLesson || nextLessonData?.nextLesson;
  const prevLesson = prevLessonData?.data?.previousLesson || prevLessonData?.previousLesson;

  const handleCompleteLesson = async () => {
    try {
      await completeLesson(id).unwrap();
      alert('تم إكمال الدرس بنجاح!');
      if (nextLesson) {
        navigate(`/lessons/${nextLesson.id}`);
      }
    } catch (error) {
      alert('فشل إكمال الدرس');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>جاري التحميل...</Typography>
      </Box>
    );
  }

  if (!lesson) {
    return (
      <Container>
        <Typography variant="h5" sx={{ mt: 4 }}>
          الدرس غير موجود
        </Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <Box sx={{ position: 'relative' }}>
                {lesson.video_url ? (
                  <video
                    controls
                    style={{ width: '100%', height: 'auto' }}
                    src={lesson.video_url}
                  >
                    {lesson.captions_url && (
                      <track
                        kind="captions"
                        src={lesson.captions_url}
                        srcLang="ar"
                        label="العربية"
                      />
                    )}
                  </video>
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      height: 400,
                      bgcolor: 'grey.900',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography color="white">لا يوجد فيديو</Typography>
                  </Box>
                )}

                {lesson.sign_language_video_url && (
                  <Paper
                    sx={{
                      position: 'absolute',
                      bottom: 16,
                      right: 16,
                      width: showSignLanguage ? 320 : 60,
                      height: showSignLanguage ? 180 : 60,
                      transition: 'all 0.3s',
                      overflow: 'hidden',
                      cursor: 'pointer',
                    }}
                    onClick={() => setShowSignLanguage(!showSignLanguage)}
                  >
                    {showSignLanguage ? (
                      <video
                        autoPlay
                        loop
                        muted
                        style={{ width: '100%', height: '100%' }}
                        src={lesson.sign_language_video_url}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'primary.main',
                        }}
                      >
                        <SignLanguageIcon sx={{ color: 'white' }} />
                      </Box>
                    )}
                  </Paper>
                )}
              </Box>

              <CardContent>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {lesson.title}
                </Typography>

                <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                  <Tab label="الوصف" />
                  {lesson.transcript && <Tab label="النص المكتوب" icon={<SubtitlesIcon />} />}
                </Tabs>

                <Box sx={{ mt: 3 }}>
                  {activeTab === 0 && (
                    <Typography variant="body1" color="text.secondary">
                      {lesson.description}
                    </Typography>
                  )}

                  {activeTab === 1 && lesson.transcript && (
                    <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {lesson.transcript}
                      </Typography>
                    </Paper>
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                  <Button
                    variant="outlined"
                    startIcon={<PrevIcon />}
                    disabled={!prevLesson}
                    onClick={() => prevLesson && navigate(`/lessons/${prevLesson.id}`)}
                  >
                    الدرس السابق
                  </Button>

                  <Button
                    variant="contained"
                    startIcon={<CheckIcon />}
                    onClick={handleCompleteLesson}
                    disabled={isCompleting}
                    sx={{ flexGrow: 1 }}
                  >
                    {isCompleting ? 'جاري الإكمال...' : 'إكمال الدرس'}
                  </Button>

                  <Button
                    variant="outlined"
                    endIcon={<NextIcon />}
                    disabled={!nextLesson}
                    onClick={() => nextLesson && navigate(`/lessons/${nextLesson.id}`)}
                  >
                    الدرس التالي
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  معلومات الدرس
                </Typography>

                {lesson.duration && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      المدة
                    </Typography>
                    <Typography variant="body1" fontWeight="600">
                      {lesson.duration} دقيقة
                    </Typography>
                  </Box>
                )}

                {lesson.type && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      النوع
                    </Typography>
                    <Typography variant="body1" fontWeight="600">
                      {lesson.type}
                    </Typography>
                  </Box>
                )}

                {lesson.order && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      الترتيب
                    </Typography>
                    <Typography variant="body1" fontWeight="600">
                      الدرس رقم {lesson.order}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {(lesson.captions_url || lesson.sign_language_video_url) && (
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    إمكانية الوصول
                  </Typography>

                  {lesson.captions_url && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <SubtitlesIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2">
                        ترجمة نصية متاحة
                      </Typography>
                    </Box>
                  )}

                  {lesson.sign_language_video_url && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SignLanguageIcon sx={{ mr: 1, color: 'secondary.main' }} />
                      <Typography variant="body2">
                        فيديو لغة الإشارة متاح
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default LessonView;
