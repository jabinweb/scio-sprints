'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

interface ClassItem {
  id: number | string;
  name: string;
  description?: string;
  price?: number | string; // in paise or formatted
}

// Helper to get a unique icon for each class
function getClassIcon(className: string) {
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
        <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-10">
            Choose your classroom and dive straight into an exciting journey of lessons, activities, and challenges designed just for you.
        </p>
        <div className="flex justify-center px-4">
          <div className="flex flex-wrap gap-4 justify-center max-w-5xl">
            {classes.map((c) => (
              <Card
                key={c.id}
                className="relative cursor-pointer text-center pb-4 pt-10 px-8 flex items-center justify-center hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/dashboard/class/${c.id}`)}
                role="button"
                aria-label={`Open class ${c.name}`}
              >
                {/* Price badge (top-right) */}
                {c.price !== undefined && c.price !== null && (
                  <div className="absolute top-1 right-1">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/95 text-sm font-semibold text-gray-800 shadow">
                      {formatINR(c.price)}/year
                    </span>
                  </div>
                )}

                <CardContent className="p-0 space-y-2">
                  <span className='text-5xl'>{getClassIcon(c.name)}</span>
                  <div className="text-lg font-medium">{c.name}</div>
                  {/* {c.price !== undefined && c.price !== null && (
                    <div className="text-sm text-gray-600 mt-1">
                      {formatINR(c.price)}
                    </div>
                  )} */}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Refund highlight under tiles */}
        <div className="text-center mt-6">
          <div className="inline-flex flex-col items-center gap-2 px-4 py-3 bg-green-50 rounded-xl border border-green-100 max-w-xl mx-auto">
            <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-bold mb-1">7-Day No-Questions-Asked Refund</span>
            <span className="text-base text-gray-700 font-medium text-center">Try ScioSprints risk-free. If it’s not the right fit for your child, get a full refund within 7 days — no questions asked!</span>
          </div>
        </div>
        {/* Promotional note under the refund highlight */}
        <div className="text-center mt-3">
          <p className="text-sm text-gray-600 font-semibold">Try out one subject at just Rs.299/year!</p>
        </div>
      </div>
    </section>
  );
}

function formatINR(value: number | string) {
  // If value is a string already formatted, return as-is
  if (typeof value === 'string') return value;
  // If value looks like paise (e.g., 29900), divide by 100
  const amount = value > 1000 ? value / 100 : value;
  // Format to INR currency
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);
  } catch {
    return `₹${(amount).toFixed(0)}`;
  }
}
