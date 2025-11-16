import { Skeleton } from '../ui/skeleton';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';

export const AppointmentFormSkeleton = () => {
  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="p-4 border-b">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64 mt-1" />
      </CardHeader>
      
      <div className="bg-muted/50 px-4 md:px-6 py-3 md:py-4 border-b">
        <div className="flex gap-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      
      <Separator />
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-40 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <div className="flex gap-4">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
              </div>
            </div>
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-24 w-full" />
        </div>
      </CardContent>
      
      <div className="flex justify-end gap-3 px-6 py-4 border-t">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-48" />
      </div>
    </Card>
  );
};

