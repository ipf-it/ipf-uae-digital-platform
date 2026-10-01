import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SiteLayout } from "./components/layout/SiteLayout";
import { PageLoader } from "./components/layout/PageLoader";
import { AdminLayout } from "./admin/AdminLayout";
import { ToastProvider } from "./components/ui/Toast";
import HomePage from "./pages/HomePage";

const AboutPage = lazy(() => import("./pages/AboutPage"));
const LeadershipPage = lazy(() => import("./pages/LeadershipPage"));
const GovernancePage = lazy(() => import("./pages/GovernancePage"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const ChaptersPage = lazy(() => import("./pages/ChaptersPage"));
const ChapterPage = lazy(() => import("./pages/ChapterPage"));
const CouncilsPage = lazy(() => import("./pages/CouncilsPage"));
const CouncilPage = lazy(() => import("./pages/CouncilPage"));
const DiscoverIndiaPage = lazy(() => import("./pages/DiscoverIndiaPage"));
const ExploreUaePage = lazy(() => import("./pages/ExploreUaePage"));
const DrishtiPage = lazy(() => import("./pages/DrishtiPage"));
const EventsPage = lazy(() => import("./pages/EventsPage"));
const EventDetailPage = lazy(() => import("./pages/EventDetailPage"));
const ResourcesPage = lazy(() => import("./pages/ResourcesPage"));
const SponsorsPage = lazy(() => import("./pages/SponsorsPage"));
const ActivitiesPage = lazy(() => import("./pages/ActivitiesPage"));
const PortalCardPage = lazy(() => import("./pages/PortalCardPage"));
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
const DashboardTab = lazy(() => import("./admin/tabs/DashboardTab"));
const OperationsTab = lazy(() => import("./admin/tabs/OperationsTab"));
const OrganisationTab = lazy(() => import("./admin/tabs/OrganisationTab"));
const PagesTab = lazy(() => import("./admin/tabs/PagesTab"));
const PublicationsTab = lazy(() => import("./admin/tabs/PublicationsTab"));
const NavigationTab = lazy(() => import("./admin/tabs/NavigationTab"));
const CmsTab = lazy(() => import("./admin/tabs/CmsTab"));
const SupportTab = lazy(() => import("./admin/tabs/SupportTab"));
const PeopleTab = lazy(() => import("./admin/tabs/PeopleTab"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
      <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<DashboardTab />} />
          <Route path="operations" element={<OperationsTab />} />
          <Route path="organisation" element={<OrganisationTab />} />
          <Route path="pages" element={<PagesTab />} />
          <Route path="publications" element={<PublicationsTab />} />
          <Route path="navigation" element={<NavigationTab />} />
          <Route path="cms" element={<CmsTab />} />
          <Route path="support" element={<SupportTab />} />
          <Route path="people" element={<PeopleTab />} />
        </Route>
        <Route element={<SiteLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="leadership" element={<LeadershipPage />} />
          <Route path="governance" element={<GovernancePage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="chapters" element={<ChaptersPage />} />
          <Route path="chapters/:chapterId" element={<ChapterPage />} />
          <Route path="councils" element={<CouncilsPage />} />
          <Route path="councils/:councilId" element={<CouncilPage />} />
          <Route path="discover-india" element={<DiscoverIndiaPage />} />
          <Route path="explore-uae" element={<ExploreUaePage />} />
          <Route path="drishti" element={<DrishtiPage />} />
          <Route path="resources" element={<ResourcesPage />} />
          <Route path="sponsors" element={<SponsorsPage />} />
          <Route path="activities" element={<ActivitiesPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="events/:eventId" element={<EventDetailPage />} />
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
          <Route path="portal" element={<PortalPage />} />
          <Route path="portal/card" element={<PortalCardPage />} />
          <Route path="yuva" element={<YuvaPage />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      </Suspense>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
