export function CuratedSkeleton() {
  return (
    <section className="w-full py-12">
      <div className="container space-y-8">
        <div className="text-center space-y-4">
          <div className="h-8 w-64 bg-gray-200 rounded mx-auto animate-pulse" />
          <div className="h-4 w-96 bg-gray-200 rounded mx-auto animate-pulse" />
        </div>
        <div className="space-y-8">
          {[2024, 2023].map((year) => (
            <div key={year} className="space-y-4">
              <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg bg-gray-100 animate-pulse"
                  >
                    <div className="h-6 w-32 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
