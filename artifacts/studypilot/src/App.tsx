import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setAuthTokenGetter } from '@workspace/api-client-react';
import { getAccessToken, getCurrentUser } from '@/lib/auth';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

// Public pages
import Landing from '@/pages/public/Landing';
import Pricing from '@/pages/public/Pricing';
import Login from '@/pages/public/Login';
import Signup from '@/pages/public/Signup';
import Privacy from '@/pages/public/Privacy';
import Terms from '@/pages/public/Terms';

// App pages
import Dashboard from '@/pages/app/Dashboard';
import Courses from '@/pages/app/Courses';
import CourseDetail from '@/pages/app/CourseDetail';
import Plan from '@/pages/app/Plan';
import Flashcards from '@/pages/app/Flashcards';
import Quiz from '@/pages/app/Quiz';
import Exams from '@/pages/app/Exams';
import Progress from '@/pages/app/Progress';
import Subscription from '@/pages/app/Subscription';
import Settings from '@/pages/app/Settings';

// Layouts
import AppLayout from '@/components/layout/AppLayout';
import PublicLayout from '@/components/layout/PublicLayout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});
setAuthTokenGetter(getAccessToken);

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        {/* Public Routes */}
        <Route path="/" component={() => <PublicLayout><Landing /></PublicLayout>} />
        <Route path="/pricing" component={() => <PublicLayout><Pricing /></PublicLayout>} />
        <Route path="/login" component={() => <PublicLayout><Login /></PublicLayout>} />
        <Route path="/signup" component={() => <PublicLayout><Signup /></PublicLayout>} />
        <Route path="/privacy" component={() => <PublicLayout><Privacy /></PublicLayout>} />
        <Route path="/terms" component={() => <PublicLayout><Terms /></PublicLayout>} />

        {/* App Routes */}
         <Route path="/app" component={() => <ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
         <Route path="/app/courses" component={() => <ProtectedRoute><AppLayout><Courses /></AppLayout></ProtectedRoute>} />
         <Route path="/app/courses/:id" component={() => <ProtectedRoute><AppLayout><CourseDetail /></AppLayout></ProtectedRoute>} />
         <Route path="/app/plan" component={() => <ProtectedRoute><AppLayout><Plan /></AppLayout></ProtectedRoute>} />
         <Route path="/app/flashcards" component={() => <ProtectedRoute><AppLayout><Flashcards /></AppLayout></ProtectedRoute>} />
         <Route path="/app/quiz" component={() => <ProtectedRoute><AppLayout><Quiz /></AppLayout></ProtectedRoute>} />
         <Route path="/app/exams" component={() => <ProtectedRoute><AppLayout><Exams /></AppLayout></ProtectedRoute>} />
         <Route path="/app/progress" component={() => <ProtectedRoute><AppLayout><Progress /></AppLayout></ProtectedRoute>} />
         <Route path="/app/subscription" component={() => <ProtectedRoute><AppLayout><Subscription /></AppLayout></ProtectedRoute>} />
         <Route path="/app/settings" component={() => <ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />

        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  if (!getAccessToken() || !getCurrentUser()) {
    if (typeof window !== "undefined") setLocation(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    return null;
  }
  return <>{children}</>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
