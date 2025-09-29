'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

interface ClassItem {
  id: number | string;
  name: string;
  description?: string;
  price?: number | string; // in paisa or formatted
}

export default function ClassesTiles() {
  const [classes, setClasses] = useState<ClassItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    const fetchClasses = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/classes');
        if (!res.ok) throw new Error('Failed to fetch classes');
        const data = await res.json();
        if (mounted) {
          setClasses(Array.isArray(data) ? data : []);
        }
      } catch (err: unknown) {
        console.error(err);
        if (mounted) setError((err as Error).message || 'Error loading classes');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchClasses();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="py-8 text-center">Loading classes...</div>;
  if (error) return <div className="py-8 text-center text-red-600">{error}</div>;
  if (!classes || classes.length === 0) return <div className="py-8 text-center">No classes available</div>;

  return (
    <section id="classes" className="py-12">
      <div className="container mx-auto px-6">
        <div className="flex justify-center px-4">
          <div className="flex flex-wrap gap-4 justify-center max-w-5xl">
            {classes.map((c) => (
              <Card
                key={c.id}
                className="cursor-pointer text-center py-6 px-6 flex items-center justify-center hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/dashboard/class/${c.id}`)}
                role="button"
                aria-label={`Open class ${c.name}`}
              >
                <CardContent className="p-0">
                  <div className="text-base font-medium">{c.name}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
