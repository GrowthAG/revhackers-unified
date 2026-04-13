import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton = ({ className, ...props }: SkeletonProps) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-zinc-100 rounded-md',
        className
      )}
      {...props}
    />
  );
};

// Skeleton para AdminDashboard
export const DashboardSkeleton = () => (
  <div className="min-h-screen bg-white px-6 md:px-10 lg:px-14 py-8 space-y-10">
    {/* Header + KPI strip */}
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-2 p-4 border border-zinc-100">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
    {/* Quick-access */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-zinc-50 p-4 space-y-2">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
    {/* Divider */}
    <div className="flex items-center gap-3">
      <div className="h-[2px] flex-1 bg-zinc-100" />
      <Skeleton className="h-3 w-20" />
      <div className="h-[2px] flex-1 bg-zinc-100" />
    </div>
    {/* Project health rows */}
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border border-zinc-100">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-16 ml-auto" />
        </div>
      ))}
    </div>
  </div>
);

// Skeleton para RevenueCockpit
export const PipelineSkeleton = () => (
  <div className="min-h-screen bg-white px-6 md:px-10 lg:px-14 py-8 space-y-8">
    {/* Header */}
    <div className="space-y-3">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-80" />
    </div>
    {/* KPI cards */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="border border-zinc-100 p-4 space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-14" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
    {/* Tabs */}
    <div className="flex gap-2">
      <Skeleton className="h-8 w-28" />
      <Skeleton className="h-8 w-28" />
      <Skeleton className="h-8 w-28" />
    </div>
    {/* Lead rows */}
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border border-zinc-100">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16 ml-auto" />
          <Skeleton className="h-6 w-24" />
        </div>
      ))}
    </div>
  </div>
);

// Skeleton para ProjectDetails
export const ProjectDetailsSkeleton = () => (
  <div className="space-y-0">
    {/* Header */}
    <div className="px-4 sm:px-8 py-6 space-y-3">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-40" />
    </div>
    {/* Journey bar */}
    <div className="px-4 sm:px-8 py-4 border-y border-zinc-100">
      <div className="flex items-center gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-6 w-6 rounded-full" />
            {i < 5 && <Skeleton className="h-0.5 w-10" />}
          </div>
        ))}
      </div>
    </div>
    {/* Metadata table */}
    <div className="px-4 sm:px-8 py-3 border-b border-zinc-100">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-2.5 w-14" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
    {/* Tabs */}
    <div className="px-4 sm:px-8 py-4 flex gap-4">
      <Skeleton className="h-9 w-24" />
      <Skeleton className="h-9 w-24" />
      <Skeleton className="h-9 w-24" />
    </div>
    {/* Content */}
    <div className="px-4 sm:px-8 py-6 space-y-4">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-20" />
      ))}
    </div>
  </div>
);

// Skeleton para Cards List
export const CardsListSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="border border-zinc-200 p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2 mt-4">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    ))}
  </div>
);
