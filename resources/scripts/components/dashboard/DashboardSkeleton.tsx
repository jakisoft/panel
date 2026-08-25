import React from 'react';

/* ── Shimmer Block Helper ────────────────────────────────────────────── */
export const ShimmerBlock = ({ className = '' }: { className?: string }) => (
    <div className={`animate-shimmer bg-neutral-850 rounded-xl ${className}`} />
);

/* ── Skeleton for Overview Metric Cards ───────────────────────────────── */
export const StatCardsSkeleton = () => (
    <div className={'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'}>
        {[1, 2, 3, 4].map((i) => (
            <div key={i} className={'p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between'}>
                <div className={'flex items-center justify-between'}>
                    <ShimmerBlock className={'w-24 h-4'} />
                    <ShimmerBlock className={'w-10 h-10 rounded-xl'} />
                </div>
                <div className={'my-3'}>
                    <ShimmerBlock className={'w-32 h-7'} />
                    <ShimmerBlock className={'w-44 h-3 mt-2'} />
                </div>
                <ShimmerBlock className={'w-full h-1.5 rounded-full'} />
            </div>
        ))}
    </div>
);

/* ── Skeleton for Server Cards (2-Column Grid) ───────────────────────── */
export const ServerCardsSkeleton = ({ count = 4 }: { count?: number }) => (
    <div className={'grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4'}>
        {Array.from({ length: count }).map((_, i) => (
            <div
                key={i}
                className={
                    'p-4 sm:p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between'
                }
            >
                {/* Header Skeleton */}
                <div className={'flex items-start justify-between gap-3'}>
                    <div className={'flex items-center gap-3 min-w-0 flex-1'}>
                        <ShimmerBlock className={'w-11 h-11 rounded-xl shrink-0'} />
                        <div className={'min-w-0 flex-1 space-y-2'}>
                            <ShimmerBlock className={'w-36 h-5'} />
                            <ShimmerBlock className={'w-28 h-3.5'} />
                        </div>
                    </div>
                    <ShimmerBlock className={'w-20 h-6 rounded-md'} />
                </div>

                {/* Metrics Capsule Skeleton */}
                <div className={'mt-3 pt-3 border-t border-neutral-800/70 grid grid-cols-3 gap-2 sm:gap-2.5'}>
                    {[1, 2, 3].map((m) => (
                        <div key={m} className={'bg-neutral-850 rounded-xl p-2.5 space-y-2'}>
                            <div className={'flex justify-between'}>
                                <ShimmerBlock className={'w-10 h-3'} />
                                <ShimmerBlock className={'w-6 h-3'} />
                            </div>
                            <ShimmerBlock className={'w-14 h-4'} />
                            <ShimmerBlock className={'w-full h-1 rounded-full'} />
                        </div>
                    ))}
                </div>
            </div>
        ))}
    </div>
);
