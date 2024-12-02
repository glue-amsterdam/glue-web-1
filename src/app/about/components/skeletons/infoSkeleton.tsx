export function InfoSectionSkeleton() {
  return (
    <div className="space-y-16 animate-pulse">
      <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-6 bg-gray-200 rounded w-full mb-8"></div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2 h-[400px] bg-gray-200 rounded-lg"></div>
          <div className="md:w-1/2 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/5"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
