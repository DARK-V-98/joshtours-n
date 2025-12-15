
import React, { Suspense } from 'react';
import LoginForm from './LoginForm';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

function LoginSkeleton() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-md mx-auto">
                <Card>
                    <CardHeader className="text-center">
                        <Skeleton className="h-8 w-24 mx-auto" />
                        <Skeleton className="h-4 w-48 mx-auto mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                           <Skeleton className="h-4 w-16" />
                           <Skeleton className="h-10 w-full" />
                        </div>
                         <div className="space-y-2">
                           <Skeleton className="h-4 w-16" />
                           <Skeleton className="h-10 w-full" />
                        </div>
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-4 w-40 mx-auto" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}


export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}
