import React, { useEffect, useRef, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import login from '@/api/auth/login';
import LoginFormContainer from '@/components/auth/LoginFormContainer';
import { useStoreState } from 'easy-peasy';
import { Formik, FormikHelpers } from 'formik';
import { object, string } from 'yup';
import AuthField from '@/components/auth/AuthField';
import AuthButton from '@/components/auth/AuthButton';
import Reaptcha from 'reaptcha';
import ReCaptchaPortal from '@/components/auth/ReCaptchaPortal';
import useFlash from '@/plugins/useFlash';
import { User, Lock, LogIn } from 'lucide-react';

interface Values {
    username: string;
    password: string;
}

const LoginContainer = ({ history }: RouteComponentProps) => {
    const ref = useRef<Reaptcha>(null);
    const [token, setToken] = useState('');

    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { enabled: recaptchaEnabled, siteKey } = useStoreState((state) => state.settings.data!.recaptcha);

    useEffect(() => {
        clearFlashes();
    }, []);

    const onSubmit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes();

        if (recaptchaEnabled && !token) {
            ref.current!.execute().catch((error) => {
                console.error(error);
                setSubmitting(false);
                clearAndAddHttpError({ error });
            });
            return;
        }

        login({ ...values, recaptchaData: token })
            .then((response) => {
                if (response.complete) {
                    // @ts-expect-error this is valid
                    window.location = response.intended || '/';
                    return;
                }
                history.replace('/auth/login/checkpoint', { token: response.confirmationToken });
            })
            .catch((error) => {
                console.error(error);
                setToken('');
                if (ref.current) ref.current.reset();
                setSubmitting(false);
                clearAndAddHttpError({ error });
            });
    };

    return (
        <Formik
            onSubmit={onSubmit}
            initialValues={{ username: '', password: '' }}
            validationSchema={object().shape({
                username: string().required('Username atau email wajib diisi.'),
                password: string().required('Kata sandi akun wajib diisi.'),
            })}
        >
            {({ isSubmitting, submitForm }) => (
                <LoginFormContainer
                    title={'Masuk ke Akun'}
                    subtitle={'Silakan masukkan kredensial akun Anda untuk mengelola server'}
                >
                    <AuthField
                        name={'username'}
                        label={'Username atau Email'}
                        icon={User}
                        placeholder={'Masukkan username atau email...'}
                        disabled={isSubmitting}
                        autoFocus
                    />

                    <div className={'pt-0.5'}>
                        <AuthField
                            name={'password'}
                            type={'password'}
                            label={'Kata Sandi'}
                            icon={Lock}
                            placeholder={'Masukkan kata sandi akun...'}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className={'pt-1.5'}>
                        <AuthButton
                            type={'submit'}
                            isLoading={isSubmitting}
                            disabled={isSubmitting}
                            icon={<LogIn size={18} />}
                        >
                            Masuk Sekarang
                        </AuthButton>
                    </div>

                    {recaptchaEnabled && (
                        <ReCaptchaPortal
                            ref={ref}
                            size={'invisible'}
                            badge={'bottomright'}
                            sitekey={siteKey || '_invalid_key'}
                            onVerify={(response) => {
                                setToken(response);
                                submitForm();
                            }}
                            onExpire={() => {
                                setToken('');
                            }}
                        />
                    )}

                    <div className={'pt-2 text-center'}>
                        <Link
                            to={'/auth/password'}
                            className={'text-xs font-semibold text-neutral-400 hover:text-primary-400 no-underline transition-colors'}
                        >
                            Lupa Kata Sandi?
                        </Link>
                    </div>
                </LoginFormContainer>
            )}
        </Formik>
    );
};

export default LoginContainer;
