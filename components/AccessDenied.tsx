import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';

export function AccessDenied() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-gray-600 max-w-md">
          You don&apos;t have permission to access this area. Please contact an administrator if you believe this is a mistake.
        </p>
        <Button 
          onClick={() => router.push('/')}
          variant="outline"
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
}
