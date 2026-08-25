import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import LoginContainer from '@/components/auth/LoginContainer';
import ForgotPasswordContainer from '@/components/auth/ForgotPasswordContainer';
import ResetPasswordContainer from '@/components/auth/ResetPasswordContainer';
import LoginCheckpointContainer from '@/components/auth/LoginCheckpointContainer';
import { NotFound } from '@/components/elements/ScreenBlock';
import { useHistory, useLocation } from 'react-router';

export default () => {
    const history = useHistory();
    const location = useLocation();
    const { path } = useRouteMatch();

    return (
        <div className={'min-h-screen w-full flex flex-col justify-center items-center py-10 sm:py-16 px-3 sm:px-6 relative overflow-hidden bg-neutral-950 text-neutral-100'}>
            {/* Ambient Background Glow */}
            <div className={'absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-primary-600/10 blur-[130px] pointer-events-none rounded-full'} />
            <div className={'absolute -bottom-40 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-cyan-600/5 blur-[130px] pointer-events-none rounded-full'} />

            <div className={'w-full max-w-md relative z-10'}>
                <Switch location={location}>
                    <Route path={`${path}/login`} component={LoginContainer} exact />
                    <Route path={`${path}/login/checkpoint`} component={LoginCheckpointContainer} />
                    <Route path={`${path}/password`} component={ForgotPasswordContainer} exact />
                    <Route path={`${path}/password/reset/:token`} component={ResetPasswordContainer} />
                    <Route path={`${path}/checkpoint`} />
                    <Route path={'*'}>
                        <NotFound onBack={() => history.push('/auth/login')} />
                    </Route>
                </Switch>
            </div>
        </div>
    );
};
