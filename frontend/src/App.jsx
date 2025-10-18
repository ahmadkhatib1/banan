import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUserRole } from './store/slices/authSlice';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import InstructorDashboard from './pages/dashboard/InstructorDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import CourseList from './pages/courses/CourseList';
import CourseDetails from './pages/courses/CourseDetails';
import LessonView from './pages/lessons/LessonView';
import QuizList from './pages/quizzes/QuizList';
import QuizTake from './pages/quizzes/QuizTake';
import QuizResults from './pages/quizzes/QuizResults';
import CreateCourse from './pages/instructor/CreateCourse';
import CreateLesson from './pages/instructor/CreateLesson';
import ProfileView from './pages/profile/ProfileView';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRouter />
          </ProtectedRoute>
        }
      />

      <Route
        path="/courses"
        element={
          <ProtectedRoute>
            <CourseList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/courses/:id"
        element={
          <ProtectedRoute>
            <CourseDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/lessons/:id"
        element={
          <ProtectedRoute>
            <LessonView />
          </ProtectedRoute>
        }
      />

      <Route
        path="/courses/:courseId/quizzes"
        element={
          <ProtectedRoute>
            <QuizList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/quizzes/:quizId/take"
        element={
          <ProtectedRoute>
            <QuizTake />
          </ProtectedRoute>
        }
      />

      <Route
        path="/quizzes/:quizId/results"
        element={
          <ProtectedRoute>
            <QuizResults />
          </ProtectedRoute>
        }
      />

      <Route
        path="/instructor/courses/create"
        element={
          <ProtectedRoute allowedRoles={['INSTRUCTOR', 'CONTENT_ADMIN', 'SUPER_ADMIN']}>
            <CreateCourse />
          </ProtectedRoute>
        }
      />

      <Route
        path="/instructor/courses/:courseId/lessons/create"
        element={
          <ProtectedRoute allowedRoles={['INSTRUCTOR', 'CONTENT_ADMIN', 'SUPER_ADMIN']}>
            <CreateLesson />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfileView />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function DashboardRouter() {
  const role = useSelector(selectUserRole);

  if (role === 'ADMIN' || role === 'Super Admin') {
    return <AdminDashboard />;
  } else if (role === 'INSTRUCTOR' || role === 'Instructor') {
    return <InstructorDashboard />;
  } else {
    return <StudentDashboard />;
  }
}

export default App;
