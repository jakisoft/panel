import React, { useEffect, useState } from 'react';
import { Server } from '@/api/server/getServer';
import getServers from '@/api/getServers';
import ServerRow from '@/components/dashboard/ServerRow';
import Spinner from '@/components/elements/Spinner';
import PageContentBlock from '@/components/elements/PageContentBlock';
import useFlash from '@/plugins/useFlash';
import { useStoreState } from 'easy-peasy';
import { usePersistedState } from '@/plugins/usePersistedState';
import Switch from '@/components/elements/Switch';
import tw from 'twin.macro';
import useSWR from 'swr';
import { PaginatedResult } from '@/api/http';
import Pagination from '@/components/elements/Pagination';
import { useLocation } from 'react-router-dom';
import { Dialog } from '@/components/elements/dialog';
import { Button } from '@/components/elements/button/index';
import { Activity, ShieldCheck } from 'lucide-react';

export default () => {
    const { search } = useLocation();
    const [showDeniedModal, setShowDeniedModal] = useState(new URLSearchParams(search).get('access_denied') === '1');
    const defaultPage = Number(new URLSearchParams(search).get('page') || '1');

    const [page, setPage] = useState(!isNaN(defaultPage) && defaultPage > 0 ? defaultPage : 1);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const uuid = useStoreState((state) => state.user.data!.uuid);
    const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const [showOnlyAdmin, setShowOnlyAdmin] = usePersistedState(`${uuid}:show_all_servers`, false);

    const { data: servers, error } = useSWR<PaginatedResult<Server>>(
        ['/api/client/servers', showOnlyAdmin && rootAdmin, page],
        () => getServers({ page, type: showOnlyAdmin && rootAdmin ? 'admin' : undefined })
    );

    useEffect(() => {
        setPage(1);
    }, [showOnlyAdmin]);

    useEffect(() => {
        const params = new URLSearchParams(search);
        if (params.get('access_denied') === '1') {
            setShowDeniedModal(true);
            params.delete('access_denied');
            const query = params.toString();
            window.history.replaceState(null, document.title, `/${query ? `?${query}` : ''}`);
        }
    }, [search]);

    useEffect(() => {
        if (!servers) return;
        if (servers.pagination.currentPage > 1 && !servers.items.length) {
            setPage(1);
        }
    }, [servers?.pagination.currentPage]);

    useEffect(() => {
        // Don't use react-router to handle changing this part of the URL, otherwise it
        // triggers a needless re-render. We just want to track this in the URL incase the
        // user refreshes the page.
        window.history.replaceState(null, document.title, `/${page <= 1 ? '' : `?page=${page}`}`);
    }, [page]);

    useEffect(() => {
        if (error) clearAndAddHttpError({ key: 'dashboard', error });
        if (!error) clearFlashes('dashboard');
    }, [error]);

    return (
        <PageContentBlock title={'Dashboard'} showFlashKey={'dashboard'}>
            <div css={tw`mb-4 grid grid-cols-1 md:grid-cols-2 gap-3`}>
                <div css={tw`rounded-xl border border-neutral-700 bg-neutral-800/60 px-4 py-3`}>
                    <p css={tw`text-xs uppercase tracking-wide text-neutral-400 mb-1`}>Server Overview</p>
                    <p css={tw`text-sm text-neutral-200`}>
                        Monitor expiration dates, resource usage, and status in one place.
                    </p>
                </div>
                <div css={tw`rounded-xl border border-neutral-700 bg-neutral-800/60 px-4 py-3`}>
                    <p css={tw`text-xs uppercase tracking-wide text-neutral-400 mb-1`}>Security</p>
                    <p css={tw`text-sm text-neutral-200`}>Access to other users' servers remains protected by policy checks.</p>
                </div>
            </div>
            <Dialog
                open={showDeniedModal}
                title={'Access Denied'}
                description={'You cannot open this server unless the owner adds you on the server Users page.'}
                onClose={() => setShowDeniedModal(false)}
            >
                <Dialog.Footer>
                    <Button onClick={() => setShowDeniedModal(false)}>OK</Button>
                </Dialog.Footer>
            </Dialog>
            {rootAdmin && (
                <div css={tw`mb-4 flex justify-between items-center bg-neutral-800/60 border border-neutral-700 rounded-xl px-4 py-3`}>
                    <div css={tw`text-sm text-neutral-300 flex items-center`}>
                        <Activity size={14} css={tw`mr-2`} />
                        <span>Admin view toggle for personal and all managed servers.</span>
                    </div>
                    <div css={tw`flex items-center`}>
                        <ShieldCheck size={14} css={tw`mr-2 text-neutral-400`} />
                        <p css={tw`uppercase text-xs text-neutral-400 mr-2`}>
                            {showOnlyAdmin ? "Showing others' servers" : 'Showing your servers'}
                        </p>
                        <Switch
                            name={'show_all_servers'}
                            defaultChecked={showOnlyAdmin}
                            onChange={() => setShowOnlyAdmin((s) => !s)}
                        />
                    </div>
                </div>
            )}
            {!servers ? (
                <Spinner centered size={'large'} />
            ) : (
                <Pagination data={servers} onPageSelect={setPage}>
                    {({ items }) =>
                        items.length > 0 ? (
                            items.map((server, index) => (
                                <ServerRow key={server.uuid} server={server} css={index > 0 ? tw`mt-2` : undefined} />
                            ))
                        ) : (
                            <p css={tw`text-center text-sm text-neutral-400`}>
                                {showOnlyAdmin
                                    ? 'There are no other servers to display.'
                                    : 'There are no servers associated with your account.'}
                            </p>
                        )
                    }
                </Pagination>
            )}
        </PageContentBlock>
    );
};
