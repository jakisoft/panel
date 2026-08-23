import React, { useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import { NavLink, useLocation } from 'react-router-dom';
import { encodePathSegments, hashToPath } from '@/helpers';

interface Props {
    renderLeft?: JSX.Element;
    withinFileEditor?: boolean;
    isNewFile?: boolean;
}

const getCleanTrashFileName = (name: string): string => {
    const match = name.match(/^\d+_[a-z0-9]+_(.+)$/i);
    return match ? match[1] : name;
};

export default ({ renderLeft, withinFileEditor, isNewFile }: Props) => {
    const [file, setFile] = useState<string | null>(null);
    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const directory = ServerContext.useStoreState((state) => state.files.directory);
    const { hash } = useLocation();

    const isTrash = directory.startsWith('/.trash') || hash.includes('.trash');

    useEffect(() => {
        const path = hashToPath(hash);

        if (withinFileEditor && !isNewFile) {
            const name = path.split('/').pop() || null;
            setFile(name);
        }
    }, [withinFileEditor, isNewFile, hash]);

    if (isTrash) {
        const trashSubDirs = directory
            .split('/')
            .filter((dir) => !!dir && dir !== '.trash');

        return (
            <div
                className={'flex items-center text-sm text-neutral-500 overflow-x-auto whitespace-nowrap py-1'}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {renderLeft || null}
                <span className={'shrink-0'}>/</span>
                <span className={'px-1 text-neutral-300 shrink-0'}>home</span>
                <span className={'shrink-0'}>/</span>
                <NavLink to={`/server/${id}/files`} className={'px-1 text-neutral-200 no-underline hover:text-neutral-100 shrink-0'}>
                    container
                </NavLink>
                <span className={'shrink-0'}>/</span>
                <NavLink to={`/server/${id}/files/trash`} className={'px-1 text-neutral-200 no-underline hover:text-neutral-100 shrink-0'}>
                    .trash
                </NavLink>
                {trashSubDirs.map((dir, index) => {
                    const isLast = !withinFileEditor && index === trashSubDirs.length - 1;
                    const subPath = trashSubDirs.slice(0, index + 1).join('/');

                    return (
                        <React.Fragment key={index}>
                            <span className={'shrink-0'}>/</span>
                            {isLast ? (
                                <span className={'px-1 text-neutral-300 shrink-0'}>{getCleanTrashFileName(dir)}</span>
                            ) : (
                                <NavLink
                                    to={`/server/${id}/files/trash#/${encodePathSegments(subPath)}`}
                                    className={'px-1 text-neutral-200 no-underline hover:text-neutral-100 shrink-0'}
                                >
                                    {getCleanTrashFileName(dir)}
                                </NavLink>
                            )}
                        </React.Fragment>
                    );
                })}
                {file && (
                    <React.Fragment>
                        <span className={'shrink-0'}>/</span>
                        <span className={'px-1 text-neutral-300 shrink-0'}>{getCleanTrashFileName(file)}</span>
                    </React.Fragment>
                )}
            </div>
        );
    }

    const breadcrumbs = (): { name: string; path?: string }[] =>
        directory
            .split('/')
            .filter((dir) => !!dir)
            .map((dir, index, dirs) => {
                if (!withinFileEditor && index === dirs.length - 1) {
                    return { name: dir };
                }

                return { name: dir, path: `/${dirs.slice(0, index + 1).join('/')}` };
            });

    return (
        <div
            className={'flex items-center text-sm text-neutral-500 overflow-x-auto whitespace-nowrap py-1'}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
            {renderLeft || null}
            <span className={'shrink-0'}>/</span>
            <span className={'px-1 text-neutral-300 shrink-0'}>home</span>
            <span className={'shrink-0'}>/</span>
            <NavLink to={`/server/${id}/files`} className={'px-1 text-neutral-200 no-underline hover:text-neutral-100 shrink-0'}>
                container
            </NavLink>
            <span className={'shrink-0'}>/</span>
            {breadcrumbs().map((crumb, index) =>
                crumb.path ? (
                    <React.Fragment key={index}>
                        <NavLink
                            to={`/server/${id}/files#${encodePathSegments(crumb.path)}`}
                            className={'px-1 text-neutral-200 no-underline hover:text-neutral-100 shrink-0'}
                        >
                            {crumb.name}
                        </NavLink>
                        <span className={'shrink-0'}>/</span>
                    </React.Fragment>
                ) : (
                    <span key={index} className={'px-1 text-neutral-300 shrink-0'}>
                        {crumb.name}
                    </span>
                )
            )}
            {file && (
                <React.Fragment>
                    <span className={'shrink-0'}>/</span>
                    <span className={'px-1 text-neutral-300 shrink-0'}>{file}</span>
                </React.Fragment>
            )}
        </div>
    );
};
