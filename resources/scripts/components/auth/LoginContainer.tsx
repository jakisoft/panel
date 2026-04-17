import React, { useEffect, useRef, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Formik, FormikHelpers } from 'formik';
import { object, string } from 'yup';
import Reaptcha from 'reaptcha';
import tw from 'twin.macro';
import { ArrowRight, Eye, EyeOff, Lock, User } from 'lucide-react';
import { toast } from 'sonner';
import { useStoreState } from 'easy-peasy';
import login from '@/api/auth/login';
import LoginFormContainer from '@/components/auth/LoginFormContainer';
import AuthTextField from '@/components/auth/AuthTextField';
import { getElysiumData } from '@/components/elements/elysium/getElysiumData';
import useFlash from '@/plugins/useFlash';

interface Values {
    username: string;
    password: string;
}


const GoogleIcon = () => (
    <svg className={'w-5 h-5 mr-2.5 shrink-0'} viewBox={'0 0 24 24'}>
        <path fill={'#4285F4'} d={'M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'} />
        <path fill={'#34A853'} d={'M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'} />
        <path fill={'#FBBC05'} d={'M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z'} />
        <path fill={'#EA4335'} d={'M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'} />
    </svg>
);

const GithubIcon = () => (
    <svg className={'w-5 h-5 mr-2.5 shrink-0'} viewBox={'0 0 24 24'} fill={'currentColor'}>
        <path d={'M12 2C6.477 2 2 6.596 2 12.266c0 4.536 2.865 8.385 6.839 9.743.5.096.682-.223.682-.495 0-.245-.009-.893-.014-1.753-2.782.617-3.369-1.382-3.369-1.382-.455-1.187-1.11-1.503-1.11-1.503-.908-.638.069-.625.069-.625 1.004.073 1.532 1.057 1.532 1.057.892 1.566 2.341 1.114 2.91.852.092-.667.35-1.114.636-1.37-2.22-.259-4.555-1.14-4.555-5.074 0-1.12.39-2.036 1.03-2.753-.103-.26-.447-1.306.098-2.723 0 0 .84-.276 2.75 1.052A9.299 9.299 0 0 1 12 7.087a9.3 9.3 0 0 1 2.504.349c1.909-1.328 2.748-1.052 2.748-1.052.546 1.417.202 2.463.1 2.723.64.717 1.028 1.633 1.028 2.753 0 3.944-2.338 4.812-4.566 5.067.359.317.678.944.678 1.904 0 1.374-.012 2.48-.012 2.817 0 .275.18.596.688.494C19.137 20.647 22 16.8 22 12.266 22 6.596 17.523 2 12 2z'} />
    </svg>
);

const LoginContainer = ({ history }: RouteComponentProps) => {
    const ref = useRef<Reaptcha>(null);
    const [token, setToken] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { enabled: recaptchaEnabled, siteKey } = useStoreState((state) => state.settings.data!.recaptcha);

    useEffect(() => {
        clearFlashes();
    }, []);


    const handleSocialLogin = (provider: 'google' | 'github') => {
        const cssVar = provider === 'google' ? '--oauth-google-enabled' : '--oauth-github-enabled';
        const enabled = getElysiumData(cssVar).trim() === '1';

        if (!enabled) {
            toast.info(`${provider === 'google' ? 'Google' : 'GitHub'} OAuth belum di-setup.`, {
                description: 'Silakan hubungi admin untuk mengaktifkan social login.',
            });
            return;
        }

        window.location.href = provider === 'google' ? '/auth/google' : '/auth/github';
    };

    const onSubmit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes();

        if (recaptchaEnabled && !token) {
            ref.current!.execute().catch((error) => {
                setSubmitting(false);
                clearAndAddHttpError({ error });
            });

            return;
        }

        login({ ...values, recaptchaData: token })
            .then((response) => {
                if (response.complete) {
                    toast.success('Welcome back!', {
                        description: 'Login berhasil. Mengarahkan ke dashboard...',
                    });

                    setTimeout(() => {
                        // @ts-expect-error this is valid
                        window.location = response.intended || '/';
                    }, 300);

                    return;
                }

                history.replace('/auth/login/checkpoint', {
                    token: response.confirmationToken,
                });
            })
            .catch((error) => {
                setToken('');
                if (ref.current) ref.current.reset();

                setSubmitting(false);
                clearAndAddHttpError({ error });
                toast.error('Authentication failed', {
                    description: 'Silakan cek username/email dan password kamu.',
                });
            });
    };

    return (
        <Formik
            onSubmit={onSubmit}
            initialValues={{ username: '', password: '' }}
            validationSchema={object().shape({
                username: string().required('A username or email must be provided.'),
                password: string().required('Please enter your account password.'),
            })}
        >
            {({ isSubmitting, setSubmitting, submitForm }) => (
                <LoginFormContainer
                    title={'Authorize Account'}
                    subtitle={'Masuk menggunakan akun Elysium Panel Anda.'}
                    footer={
                        <div css={tw`text-center text-sm text-neutral-400`}>
                            Belum punya akun?{' '}
                            <Link css={tw`font-bold hover:underline`} to={'/auth/register'}>
                                Create Account
                            </Link>
                        </div>
                    }
                >
                    <AuthTextField
                        type={'text'}
                        name={'username'}
                        label={'Account Access'}
                        placeholder={'Username or email address'}
                        disabled={isSubmitting}
                        icon={<User size={18} />}
                    />

                    <AuthTextField
                        type={showPassword ? 'text' : 'password'}
                        name={'password'}
                        label={'Security Key'}
                        placeholder={'Enter your password'}
                        disabled={isSubmitting}
                        icon={<Lock size={18} />}
                        rightAdornment={
                            <button
                                type={'button'}
                                css={tw`text-neutral-400 hover:text-neutral-100`}
                                onClick={() => setShowPassword((s) => !s)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        }
                    />

                    <div css={tw`flex justify-end -mt-3`}>
                        <Link css={tw`text-xs font-semibold text-neutral-300 hover:underline`} to={'/auth/password'}>
                            Forgot Password?
                        </Link>
                    </div>

                    {recaptchaEnabled && (
                        <Reaptcha
                            ref={ref}
                            size={'invisible'}
                            sitekey={siteKey || '_invalid_key'}
                            onVerify={(response) => {
                                setToken(response);
                                submitForm();
                            }}
                            onExpire={() => {
                                setSubmitting(false);
                                setToken('');
                            }}
                        />
                    )}

                    <button
                        type={'submit'}
                        disabled={isSubmitting}
                        css={tw`w-full flex items-center justify-center py-4 rounded-2xl text-sm font-bold text-white shadow-lg disabled:opacity-60`}
                        style={{ backgroundColor: getElysiumData('--color-4').trim() || '#2563eb' }}
                    >
                        {isSubmitting ? (
                            <div css={tw`w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin`} />
                        ) : (
                            <>
                                <span>Authorize Account</span>
                                <ArrowRight size={16} css={tw`ml-2`} />
                            </>
                        )}
                    </button>

                    <div css={tw`relative my-2`}>
                        <div css={tw`absolute inset-0 flex items-center`}>
                            <div css={tw`w-full border-t border-neutral-700`} />
                        </div>
                        <div css={tw`relative flex justify-center text-[11px] uppercase tracking-widest`}>
                            <span css={tw`bg-elysium-color2 px-4 text-neutral-500`}>Secure Connect</span>
                        </div>
                    </div>

                    <div css={tw`grid grid-cols-2 gap-3`}>
                        <button
                            type={'button'}
                            css={tw`py-3 px-4 rounded-2xl border border-neutral-700 bg-elysium-color3 hover:bg-elysium-color4 text-sm font-semibold flex items-center justify-center transition-all`}
                            onClick={() => handleSocialLogin('google')}
                        >
                            <GoogleIcon />
                            <span css={tw`leading-none`}>Google</span>
                        </button>
                        <button
                            type={'button'}
                            css={tw`py-3 px-4 rounded-2xl border border-neutral-700 bg-elysium-color3 hover:bg-elysium-color4 text-sm font-semibold flex items-center justify-center transition-all`}
                            onClick={() => handleSocialLogin('github')}
                        >
                            <GithubIcon />
                            <span css={tw`leading-none`}>GitHub</span>
                        </button>
                    </div>

                </LoginFormContainer>
            )}
        </Formik>
    );
};

export default LoginContainer;
