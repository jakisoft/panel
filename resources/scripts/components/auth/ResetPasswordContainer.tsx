import React, { useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import performPasswordReset from '@/api/auth/performPasswordReset';
import { httpErrorToHuman } from '@/api/http';
import LoginFormContainer from '@/components/auth/LoginFormContainer';
import { Actions, useStoreActions } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import { Formik, FormikHelpers } from 'formik';
import { object, ref, string } from 'yup';
import AuthField from '@/components/auth/AuthField';
import Button from '@/components/elements/Button';
import { Lock, Mail, Key, ArrowLeft } from 'lucide-react';

interface Values {
    password: string;
    passwordConfirmation: string;
}

export default ({ match, location }: RouteComponentProps<{ token: string }>) => {
    const [email, setEmail] = useState('');

    const { clearFlashes, addFlash } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    const parsed = new URLSearchParams(location.search);
    if (email.length === 0 && parsed.get('email')) {
        setEmail(parsed.get('email') || '');
    }

    const submit = ({ password, passwordConfirmation }: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes();
        performPasswordReset(email, { token: match.params.token, password, passwordConfirmation })
            .then(() => {
                // @ts-expect-error this is valid
                window.location = '/';
            })
            .catch((error) => {
                console.error(error);
                setSubmitting(false);
                addFlash({ type: 'error', title: 'Gagal', message: httpErrorToHuman(error) });
            });
    };

    return (
        <Formik
            onSubmit={submit}
            initialValues={{
                password: '',
                passwordConfirmation: '',
            }}
            validationSchema={object().shape({
                password: string()
                    .required('Kata sandi baru wajib diisi.')
                    .min(8, 'Kata sandi baru minimal harus 8 karakter.'),
                passwordConfirmation: string()
                    .required('Konfirmasi kata sandi baru tidak cocok.')
                    // @ts-expect-error this is valid
                    .oneOf([ref('password'), null], 'Konfirmasi kata sandi tidak cocok.'),
            })}
        >
            {({ isSubmitting }) => (
                <LoginFormContainer
                    title={'Atur Ulang Kata Sandi'}
                    subtitle={'Buat kata sandi baru yang aman untuk akun Anda'}
                >
                    {/* Readonly Email Display */}
                    {email && (
                        <div className={'w-full space-y-1.5'}>
                            <label className={'block text-xs sm:text-sm font-semibold text-neutral-300'}>
                                Alamat Email Akun
                            </label>
                            <div className={'flex items-center rounded-xl bg-neutral-900/50 border border-neutral-800 p-2.5 sm:p-3 text-neutral-400 cursor-not-allowed'}>
                                <div className={'pl-1 pr-2.5 text-neutral-500'}>
                                    <Mail size={18} />
                                </div>
                                <span className={'text-xs sm:text-sm font-mono text-neutral-300 truncate'}>
                                    {email}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className={'pt-1'}>
                        <AuthField
                            name={'password'}
                            type={'password'}
                            label={'Kata Sandi Baru'}
                            icon={Lock}
                            placeholder={'Masukkan kata sandi baru...'}
                            description={'Kata sandi harus terdiri dari minimal 8 karakter.'}
                            disabled={isSubmitting}
                            autoFocus
                        />
                    </div>

                    <div className={'pt-1'}>
                        <AuthField
                            name={'passwordConfirmation'}
                            type={'password'}
                            label={'Konfirmasi Kata Sandi Baru'}
                            icon={Lock}
                            placeholder={'Ulangi kata sandi baru...'}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className={'pt-2'}>
                        <Button
                            size={'xlarge'}
                            type={'submit'}
                            disabled={isSubmitting}
                            isLoading={isSubmitting}
                            className={'w-full flex items-center justify-center gap-2 font-bold shadow-lg shadow-primary-600/30'}
                        >
                            <Key size={17} />
                            <span>Simpan Kata Sandi Baru</span>
                        </Button>
                    </div>

                    <div className={'pt-2 text-center'}>
                        <Link
                            to={'/auth/login'}
                            className={'inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-primary-400 no-underline transition-colors'}
                        >
                            <ArrowLeft size={14} />
                            <span>Kembali ke Halaman Login</span>
                        </Link>
                    </div>
                </LoginFormContainer>
            )}
        </Formik>
    );
};
