import React, { useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import { NavLink, useLocation } from 'react-router-dom';
import { encodePathSegments, hashToPath } from '@/helpers';
import tw from 'twin.macro';

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

    if (isTrash) {
        return (
            <div css={tw`flex flex-grow-0 items-center text-sm text-neutral-500 overflow-x-hidden`}>
                {renderLeft || <div css={tw`w-12`} />}/<span css={tw`px-1 text-neutral-300`}>home</span>/
                <NavLink to={`/server/${id}/files`} css={tw`px-1 text-neutral-200 no-underline hover:text-neutral-100`}>
                    container
                </NavLink>
                /
                <NavLink to={`/server/${id}/files/trash`} css={tw`px-1 text-neutral-200 no-underline hover:text-neutral-100`}>
                    .trash
                </NavLink>
                /
                {file && (
                    <span css={tw`px-1 text-neutral-300`}>{getCleanTrashFileName(file)}</span>
                )}
            </div>
        );
    }

    return (
        <div css={tw`flex flex-grow-0 items-center text-sm text-neutral-500 overflow-x-hidden`}>
            {renderLeft || <div css={tw`w-12`} />}/<span css={tw`px-1 text-neutral-300`}>home</span>/
            <NavLink to={`/server/${id}/files`} css={tw`px-1 text-neutral-200 no-underline hover:text-neutral-100`}>
                container
            </NavLink>
            /
            {breadcrumbs().map((crumb, index) =>
                crumb.path ? (
                    <React.Fragment key={index}>
                        <NavLink
                            to={`/server/${id}/files#${encodePathSegments(crumb.path)}`}
                            css={tw`px-1 text-neutral-200 no-underline hover:text-neutral-100`}
                        >
                            {crumb.name}
                        </NavLink>
                        /
                    </React.Fragment>
                ) : (
                    <span key={index} css={tw`px-1 text-neutral-300`}>
                        {crumb.name}
                    </span>
                )
            )}
            {file && (
                <React.Fragment>
                    <span css={tw`px-1 text-neutral-300`}>{file}</span>
                </React.Fragment>
            )}
        </div>
    );
};
