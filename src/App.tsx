import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreateBusinessPage } from './pages/CreateBusinessPage';
import { BusinessDetailPage } from './pages/BusinessDetailPage';
import { BusinessesListPage } from './pages/BusinessesListPage';
import { GenerateReviewsPage } from './pages/GenerateReviewsPage';
import { ReviewManagementPage } from './pages/ReviewManagementPage';
import { QRCodePage } from './pages/QRCodePage';
import { QRCodesListPage } from './pages/QRCodesListPage';
import { EditBusinessPage } from './pages/EditBusinessPage';
import { PublicReviewPage } from './pages/PublicReviewPage';

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/review/:slug" element={<PublicReviewPage />} />

      {/* Admin */}
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/businesses" element={<BusinessesListPage />} />
      <Route path="/qr-codes" element={<QRCodesListPage />} />
      <Route path="/business/create" element={<CreateBusinessPage />} />
      <Route path="/business/:id" element={<BusinessDetailPage />} />
      <Route path="/business/:id/edit" element={<EditBusinessPage />} />
      <Route path="/business/:id/reviews" element={<ReviewManagementPage />} />
      <Route path="/business/:id/generate" element={<GenerateReviewsPage />} />
      <Route path="/business/:id/qr" element={<QRCodePage />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
