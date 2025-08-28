import { Card, CardContent, CardHeader } from "../ui/card";

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="h-8 w-1/4 bg-gray-200 animate-pulse rounded"></div>
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, index) => (
        <Card key={index} className="bg-white/95 shadow-lg rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded"></div>
                <div className="h-6 w-1/3 bg-gray-200 animate-pulse rounded"></div>
              </div>
              <div className="h-8 w-8 bg-gray-200 animate-pulse rounded-full"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
      {[...Array(2)].map((_, index) => (
        <Card key={index} className="bg-white/95 shadow-lg rounded-xl">
          <CardHeader>
            <div className="h-4 w-1/3 bg-gray-200 animate-pulse rounded"></div>
          </CardHeader>
          <CardContent className="h-80">
            <div className="h-full w-full bg-gray-200 animate-pulse rounded"></div>
          </CardContent>
        </Card>
      ))}
      <Card className="lg:col-span-2 bg-white/95 shadow-lg rounded-xl">
        <CardHeader>
          <div className="h-4 w-1/3 bg-gray-200 animate-pulse rounded"></div>
        </CardHeader>
        <CardContent className="h-80">
          <div className="h-full w-full bg-gray-200 animate-pulse rounded"></div>
        </CardContent>
      </Card>
    </div>
  </div>
);
export default DashboardSkeleton;
