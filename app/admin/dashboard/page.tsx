'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, Timestamp, getDocs } from 'firebase/firestore';
import { Loader2, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserRole, RequestStatus } from '@/types/enums';
import { AccessDenied } from '@/components/AccessDenied';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface DemoRequest {
  id: string;
  name: string;
  email: string;
  school: string;
  role: UserRole;
  createdAt: Timestamp;
  status: RequestStatus;
}

export default function Dashboard() {
  const [requests, setRequests] = useState<DemoRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteAlert, setDeleteAlert] = useState<{ id: string; name: string } | null>(null);
  const { user, loading, userRole, deleteRequest } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect unauthenticated users
    if (!loading && !user) {
      router.replace('/admin/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Log user info
        console.log('Current user:', { uid: user.uid, email: user.email });

        const demoRef = collection(db, 'demoRequests');
        
        // First check collection access
        try {
          const testSnap = await getDocs(demoRef);
          console.log('Can access collection:', !testSnap.empty);
          console.log('Number of documents:', testSnap.size);
        } catch (e) {
          console.error('Collection access error:', e);
        }

        // Create query with type safety
        const q = query(
          demoRef,
          orderBy('createdAt', 'desc')
        );

        // Set up real-time listener
        const unsubscribe = onSnapshot(
          q,
          {
            next: (snapshot) => {
              console.log('Snapshot received, docs:', snapshot.size);
              const newRequests = snapshot.docs.map(doc => {
                const data = doc.data();
                console.log('Doc data:', { id: doc.id, ...data });
                return {
                  id: doc.id,
                  name: data.name ?? '',
                  email: data.email ?? '',
                  school: data.school ?? '',
                  role: data.role ?? '',
                  createdAt: data.createdAt,
                  status: data.status ?? 'pending'
                };
              });
              setRequests(newRequests);
              setError(null);
              setIsLoading(false);
            },
            error: (err) => {
              console.error('Snapshot error:', err);
              setError(`Data fetch error: ${err.message}`);
              setIsLoading(false);
            }
          }
        );

        return () => {
          console.log('Cleaning up listener');
          unsubscribe();
        };
      } catch (err) {
        console.error('Setup error:', err);
        setError('Failed to setup data connection');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, router]);

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteAlert({ id, name });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteAlert) return;
    
    try {
      await deleteRequest(deleteAlert.id);
      setDeleteAlert(null);
      setError(null);
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete request');
    }
  };

  // Handle loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  // Show access denied for authenticated non-admin users
  if (user && userRole !== UserRole.ADMIN) {
    return <AccessDenied />;
  }

  // Don't render anything if not authenticated
  if (!user) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Demo Requests</h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
        </div>
      ) : error ? (
        <div className="text-red-500 mb-4">{error}</div>
      ) : requests.length === 0 ? (
        <div className="text-center text-gray-500 p-8">
          No demo requests yet.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>School</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.name}</TableCell>
                <TableCell>{request.email}</TableCell>
                <TableCell>{request.school}</TableCell>
                <TableCell>{request.role}</TableCell>
                <TableCell>
                  {request.createdAt?.toDate().toLocaleDateString()}
                </TableCell>
                <TableCell>{request.status}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleDeleteClick(request.id, request.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {deleteAlert && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Alert
              variant="destructive"
              title="Delete Request"
              description={`Are you sure you want to delete the request from ${deleteAlert.name}? This action cannot be undone.`}
              onAction={handleDeleteConfirm}
              onCancel={() => setDeleteAlert(null)}
              actionLabel="Delete"
            />
          </div>
        </div>
      )}
    </div>
  );
}
