import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { WhatsAppChat } from '@/components/WhatsAppChat';
import { AuthProtectedRoute } from '@/components/auth/AuthProtectedRoute';


export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
        <Navbar />
        <AuthProtectedRoute>
          {children}
        </AuthProtectedRoute>
        <Footer />
        <WhatsAppChat />
    </>
  );
}