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

// Helper to get a unique icon for each class
function getClassIcon(className: string) {
  // Support names like 'Class 4', 'CBSE : Class 4', etc.
  // Extract the class number from the string
  const match = className.match(/Class\s*(\d+)/);
  const classNum = match ? match[1] : null;
  switch (classNum) {
    case '4':
      return '🦉';
    case '5':
      return '🦁';
    case '6':
      return '🐯';
    case '7':
      return '🐬';
    case '8':
      return '🦅';
    default:
      return '📚';
  }
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
    <section id="classes" className="py-12 text-center">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 tracking-tight text-gray-900 px-4">
          <span className="bg-gradient-to-r from-brand-blue to-brand-orange bg-clip-text text-transparent">
            Start your journey
          </span>
        </h2>
        <div className="flex justify-center px-4">
          <div className="flex flex-wrap gap-4 justify-center max-w-5xl">
            {classes.map((c) => (
              <Card
                key={c.id}
                className="cursor-pointer text-center py-6 px-8 flex items-center justify-center hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/dashboard/class/${c.id}`)}
                role="button"
                aria-label={`Open class ${c.name}`}
              >
                <CardContent className="p-0 space-y-2">
                  <span className='text-5xl'>{getClassIcon(c.name)}</span>
                  <div className="text-lg font-medium">{c.name}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
