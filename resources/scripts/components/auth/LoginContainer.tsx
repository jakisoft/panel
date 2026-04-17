import React, { useEffect, useRef, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Formik, FormikHelpers } from 'formik';
import { object, string } from 'yup';
import Reaptcha from 'reaptcha';
import tw from 'twin.macro';
import { ArrowRight, Eye, EyeOff, Github, Lock, User } from 'lucide-react';
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

const LoginContainer = ({ history }: RouteComponentProps) => {
    const ref = useRef<Reaptcha>(null);
    const [token, setToken] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { enabled: recaptchaEnabled, siteKey } = useStoreState((state) => state.settings.data!.recaptcha);

    useEffect(() => {
        clearFlashes();
    }, []);

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
                            css={tw`py-3 rounded-2xl border border-neutral-700 bg-elysium-color3 hover:bg-elysium-color4 text-sm font-semibold`}
                            onClick={() => (window.location.href = '/auth/google')}
                        >
                            Google
                        </button>
                        <button
                            type={'button'}
                            css={tw`py-3 rounded-2xl border border-neutral-700 bg-elysium-color3 hover:bg-elysium-color4 text-sm font-semibold flex items-center justify-center`}
                            onClick={() => (window.location.href = '/auth/github')}
                        >
                            <Github size={16} css={tw`mr-2`} /> GitHub
                        </button>
                    </div>

                </LoginFormContainer>
            )}
        </Formik>
    );
};

export default LoginContainer;
