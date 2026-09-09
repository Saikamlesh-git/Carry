import React from 'react';

export function ProductSkeletonGrid({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs animate-pulse flex flex-col justify-between space-y-4 min-h-[140px]"
        >
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 rounded-md w-1/3" />
            <div className="h-5 bg-slate-200 rounded-md w-3/4" />
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="h-6 bg-slate-200 rounded-md w-1/3" />
            <div className="h-9 bg-slate-200 rounded-xl w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeletonRows({ rows = 5, cols = 6 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr key={rIdx} className="animate-pulse border-b border-slate-100">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <td key={cIdx} className="px-6 py-4">
              <div className="h-4 bg-slate-200 rounded-md w-3/4" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
