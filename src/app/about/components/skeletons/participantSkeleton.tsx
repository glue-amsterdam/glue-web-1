export function ParticipantsSkeleton() {
  return (
    <div className="w-full py-12 animate-pulse">
      <div className="container">
        <div className="text-center space-y-4 mb-8">
          <div className="h-10 bg-gray-200 rounded-lg w-64 mx-auto" />
          <div className="h-4 bg-gray-200 rounded w-full max-w-[700px] mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(8)
            .fill(null)
            .map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800"
              >
                <div className="aspect-square bg-gray-200" />
                <div className="p-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
