const Skeleton = ({ className = '' }) => (
  <div className={`skeleton ${className}`} />
)

export const CardSkeleton = () => (
  <div className="bg-card rounded-2xl p-5 space-y-3">
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-8 w-36" />
    <Skeleton className="h-3 w-20" />
  </div>
)

export const TableRowSkeleton = ({ cols = 6 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
)

export const ChartSkeleton = ({ height = 200 }) => (
  <div className="bg-card rounded-2xl p-5">
    <Skeleton className="h-4 w-32 mb-4" />
    <Skeleton style={{ height }} className="w-full" />
  </div>
)

export default Skeleton
