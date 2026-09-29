export const SkeletonCard = () => (
  <div className="card p-5 space-y-3">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl shimmer" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 rounded shimmer" />
        <div className="h-3 w-1/2 rounded shimmer" />
      </div>
    </div>
    <div className="h-3 w-full rounded shimmer" />
    <div className="h-3 w-5/6 rounded shimmer" />
    <div className="h-3 w-4/6 rounded shimmer" />
  </div>
);

export const SkeletonReviewCard = () => (
  <div className="card p-5 space-y-3">
    <div className="flex items-center gap-2">
      <div className="h-5 w-20 rounded-full shimmer" />
    </div>
    <div className="space-y-2">
      <div className="h-3 w-full rounded shimmer" />
      <div className="h-3 w-5/6 rounded shimmer" />
      <div className="h-3 w-3/4 rounded shimmer" />
    </div>
    <div className="flex gap-2 pt-1">
      <div className="h-8 w-20 rounded-lg shimmer" />
      <div className="h-8 w-28 rounded-lg shimmer" />
    </div>
  </div>
);
