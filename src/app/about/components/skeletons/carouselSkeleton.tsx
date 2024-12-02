export function CarouselSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-48 bg-gray-200 rounded mb-4" />
      <div className="h-4 w-full bg-gray-200 rounded mb-6" />
      <div className="h-64 w-full bg-gray-200 rounded" />
    </div>
  );
}
