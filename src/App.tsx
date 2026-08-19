import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { SiteLayout } from "./components/layout/SiteLayout";
import { PageLoader } from "./components/layout/PageLoader";
import HomePage from "./pages/HomePage";

const AboutPage = lazy(() => import("./pages/AboutPage"));
const LeadershipPage = lazy(() => import("./pages/LeadershipPage"));
const GovernancePage = lazy(() => import("./pages/GovernancePage"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const ChaptersPage = lazy(() => import("./pages/ChaptersPage"));
const GalleryPage = lazy(() => import("./pages/GalleryPage"));
const DiscoverIndiaPage = lazy(() => import("./pages/DiscoverIndiaPage"));
const ExploreUaePage = lazy(() => import("./pages/ExploreUaePage"));
const DrishtiPage = lazy(() => import("./pages/DrishtiPage"));
const EventsPage = lazy(() => import("./pages/EventsPage"));
const SupportPage = lazy(() => import("./pages/SupportPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const NewsPage = lazy(() => import("./pages/NewsPage"));
const ArticlePage = lazy(() => import("./pages/ArticlePage"));
const PrivilegesPage = lazy(() => import("./pages/PrivilegesPage"));
const MembershipPage = lazy(() => import("./pages/MembershipPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const TestimonialsPage = lazy(() => import("./pages/TestimonialsPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const SignInPage = lazy(() => import("./pages/SignInPage"));
const DonatePage = lazy(() => import("./pages/DonatePage"));
const PortalPage = lazy(() => import("./pages/PortalPage"));
const YuvaPage = lazy(() => import("./pages/YuvaPage"));
const JobsPage = lazy(() => import("./pages/JobsPage"));
const CmsPage = lazy(() => import("./pages/CmsPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="cms" element={<CmsPage />} />
        <Route element={<SiteLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="leadership" element={<LeadershipPage />} />
          <Route path="president" element={<Navigate to="/leadership" replace />} />
          <Route path="committee" element={<Navigate to="/leadership#committee" replace />} />
          <Route path="commitee" element={<Navigate to="/leadership#committee" replace />} />
          <Route path="president-message" element={<Navigate to="/leadership" replace />} />
          <Route path="governance" element={<GovernancePage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="chapters" element={<ChaptersPage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="glimpses" element={<GalleryPage />} />
          <Route path="discover-india" element={<DiscoverIndiaPage />} />
          <Route path="explore-uae" element={<ExploreUaePage />} />
          <Route path="drishti" element={<DrishtiPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="support" element={<SupportPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="blog/:slug" element={<ArticlePage />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="news/:slug" element={<ArticlePage />} />
          <Route path="privileges" element={<PrivilegesPage />} />
          <Route path="membership" element={<MembershipPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="testimonials" element={<TestimonialsPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="sign-in" element={<SignInPage />} />
          <Route path="donate" element={<DonatePage />} />
          <Route path="donation" element={<Navigate to="/donate" replace />} />
          <Route path="donations" element={<Navigate to="/donate" replace />} />
          <Route path="portal" element={<PortalPage />} />
          <Route path="yuva" element={<YuvaPage />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="join" element={<Navigate to="/membership" replace />} />
          <Route path="about-ipf" element={<Navigate to="/about" replace />} />
          <Route path="blog" element={<Navigate to="/news" replace />} />
          <Route path="drishti-e-magazine" element={<Navigate to="/drishti" replace />} />
          <Route path="event-calendar" element={<Navigate to="/events" replace />} />
          <Route path="support-activity" element={<Navigate to="/support" replace />} />
          <Route path="ipf-application-form" element={<Navigate to="/membership" replace />} />
          <Route path="testimonial" element={<Navigate to="/testimonials" replace />} />
          <Route path="signin" element={<Navigate to="/sign-in" replace />} />
          <Route path="login" element={<Navigate to="/sign-in" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
