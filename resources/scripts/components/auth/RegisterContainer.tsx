import React, { useEffect, useRef, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Formik, FormikHelpers } from 'formik';
import { object, ref as yupRef, string } from 'yup';
import Reaptcha from 'reaptcha';
import tw from 'twin.macro';
import { ArrowRight, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { toast } from 'sonner';
import { useStoreState } from 'easy-peasy';
import register from '@/api/auth/register';
import LoginFormContainer from '@/components/auth/LoginFormContainer';
import AuthTextField from '@/components/auth/AuthTextField';
import { getElysiumData } from '@/components/elements/elysium/getElysiumData';
import useFlash from '@/plugins/useFlash';

interface Values {
    username: string;
    email: string;
    password: string;
    passwordConfirmation: string;
}

export default ({ history }: RouteComponentProps) => {
    const ref = useRef<Reaptcha>(null);
    const [token, setToken] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

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

        register({ ...values, recaptchaData: token })
            .then(() => {
                toast.success('Registrasi berhasil!', {
                    description: 'Akun berhasil dibuat. Selamat datang di dashboard.',
                });

                setTimeout(() => {
                    history.replace('/');
                    window.location.reload();
                }, 400);
            })
            .catch((error) => {
                setToken('');
                if (ref.current) ref.current.reset();

                setSubmitting(false);
                clearAndAddHttpError({ error });
                toast.error('Registrasi gagal, cek data dan coba lagi.');
            });
    };

    return (
        <Formik
            onSubmit={onSubmit}
            initialValues={{ username: '', email: '', password: '', passwordConfirmation: '' }}
            validationSchema={object().shape({
                username: string().required('Username wajib diisi.'),
                email: string().email('Format email tidak valid.').required('Email wajib diisi.'),
                password: string().min(8, 'Password minimal 8 karakter.').required('Password wajib diisi.'),
                passwordConfirmation: string()
                    .required('Konfirmasi password wajib diisi.')
                    .oneOf([yupRef('password')], 'Konfirmasi password tidak sama.'),
            })}
        >
            {({ isSubmitting, setSubmitting, submitForm }) => (
                <LoginFormContainer
                    title={'Create Account'}
                    subtitle={'Daftarkan akun Elysium baru untuk mulai menggunakan panel.'}
                    footer={
                        <div css={tw`text-center text-sm text-neutral-400`}>
                            Sudah punya akun?{' '}
                            <Link css={tw`font-bold hover:underline`} to={'/auth/login'}>
                                Login
                            </Link>
                        </div>
                    }
                >
                    <AuthTextField
                        type={'text'}
                        name={'username'}
                        label={'Username'}
                        placeholder={'your_username'}
                        disabled={isSubmitting}
                        icon={<User size={18} />}
                    />

                    <AuthTextField
                        type={'email'}
                        name={'email'}
                        label={'Email'}
                        placeholder={'name@domain.com'}
                        disabled={isSubmitting}
                        icon={<Mail size={18} />}
                    />

                    <AuthTextField
                        type={showPassword ? 'text' : 'password'}
                        name={'password'}
                        label={'Password'}
                        placeholder={'Create a secure password'}
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

                    <AuthTextField
                        type={showPasswordConfirmation ? 'text' : 'password'}
                        name={'passwordConfirmation'}
                        label={'Confirm Password'}
                        placeholder={'Repeat your password'}
                        disabled={isSubmitting}
                        icon={<Lock size={18} />}
                        rightAdornment={
                            <button
                                type={'button'}
                                css={tw`text-neutral-400 hover:text-neutral-100`}
                                onClick={() => setShowPasswordConfirmation((s) => !s)}
                            >
                                {showPasswordConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        }
                    />

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
                                <span>Create Account</span>
                                <ArrowRight size={16} css={tw`ml-2`} />
                            </>
                        )}
                    </button>
                </LoginFormContainer>
            )}
        </Formik>
    );
};
