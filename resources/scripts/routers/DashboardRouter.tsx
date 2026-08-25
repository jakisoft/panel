import React from 'react';
import { Route, Switch } from 'react-router-dom';
import NavigationBar from '@/components/NavigationBar';
import DashboardOverviewContainer from '@/components/dashboard/DashboardOverviewContainer';
import ServerListContainer from '@/components/dashboard/ServerListContainer';
import { NotFound } from '@/components/elements/ScreenBlock';
import TransitionRouter from '@/TransitionRouter';
import { useLocation } from 'react-router';
import Spinner from '@/components/elements/Spinner';
import routes from '@/routers/routes';
import { SidebarProvider, useSidebar } from '@/components/SidebarContext';
import DashboardSidebar from '@/components/navigation/DashboardSidebar';

const DashboardLayout = () => {
    const location = useLocation();
    const { isOpen } = useSidebar();

    return (
        <div className={'min-h-screen bg-neutral-950 text-neutral-100'}>
            <DashboardSidebar />
            <div className={`flex flex-col min-h-screen transition-all duration-300 ${isOpen ? 'lg:pl-64' : 'lg:pl-0'}`}>
                <NavigationBar />
                <main className={'flex-1 w-full'}>
                    <TransitionRouter>
                        <React.Suspense fallback={<Spinner centered />}>
                            <Switch location={location}>
                                <Route path={'/'} exact>
                                    <DashboardOverviewContainer />
                                </Route>
                                <Route path={['/server', '/servers']} exact>
                                    <ServerListContainer />
                                </Route>
                                {routes.account.map(({ path, component: Component }) => (
                                    <Route key={path} path={`/account/${path}`.replace('//', '/')} exact>
                                        <Component />
                                    </Route>
                                ))}
                                <Route path={'*'}>
                                    <NotFound />
                                </Route>
                            </Switch>
                        </React.Suspense>
                    </TransitionRouter>
                </main>
            </div>
        </div>
    );
};

export default () => {
    return (
        <SidebarProvider>
            <DashboardLayout />
        </SidebarProvider>
    );
};
