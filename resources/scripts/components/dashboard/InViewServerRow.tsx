import React, { useEffect, useRef, useState } from 'react';
import { Server } from '@/api/server/getServer';
import ServerRow from '@/components/dashboard/ServerRow';

interface Props {
    server: Server;
    className?: string;
}

export default ({ server, className }: Props) => {
    const ref = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el || typeof IntersectionObserver === 'undefined') {
            setInView(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                // When in view (or within 150px margin), mount ServerRow
                // When scrolled past/out of view, unmount to save CPU & stop polling
                setInView(entry.isIntersecting);
            },
            {
                rootMargin: '180px 0px 180px 0px',
                threshold: 0.01,
            }
        );

        observer.observe(el);

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <div ref={ref} className={`min-h-[148px] sm:min-h-[156px] ${className || ''}`}>
            {inView ? (
                <div className={'aos-card-enter h-full'}>
                    <ServerRow server={server} />
                </div>
            ) : (
                /* Lightweight placeholder when scrolled out of viewport */
                <div className={'h-full min-h-[148px] sm:min-h-[156px] rounded-2xl bg-neutral-900/40 border border-neutral-800/30'} />
            )}
        </div>
    );
};
