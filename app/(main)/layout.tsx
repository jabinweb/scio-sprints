import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { WhatsAppChat } from '@/components/WhatsAppChat';


export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
        <Header />
          {children}
        <Footer />
        <WhatsAppChat />
    </>
  );
}