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
import Field from '@/components/elements/Field';
import Input from '@/components/elements/Input';
import tw from 'twin.macro';
import Button from '@/components/elements/Button';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

interface Values {
    password: string;
    passwordConfirmation: string;
}

export default ({ match, location }: RouteComponentProps<{ token: string }>) => {
    const [email, setEmail] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

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
                addFlash({ type: 'error', title: 'Error', message: httpErrorToHuman(error) });
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
                    .required('A new password is required.')
                    .min(8, 'Your new password should be at least 8 characters in length.'),
                passwordConfirmation: string()
                    .required('Your new password does not match.')
                    // @ts-expect-error this is valid
                    .oneOf([ref('password'), null], 'Your new password does not match.'),
            })}
        >
            {({ isSubmitting }) => (
                <LoginFormContainer title={'Reset Password'} css={tw`w-full flex`}>
                    <div css={tw`relative`}>
                        <label>Email</label>
                        <Mail css={tw`absolute left-3 top-10 z-10 h-4 w-4 text-neutral-500`} />
                        <Input value={email} isLight disabled className={'pl-10'} />
                    </div>
                    <div css={tw`mt-6`}>
                        <div css={tw`relative`}>
                            <Lock css={tw`absolute left-3 top-11 z-10 h-4 w-4 text-neutral-500`} />
                            <button
                                type={'button'}
                                onClick={() => setShowPassword((s) => !s)}
                                css={tw`absolute right-3 top-10 z-10 text-neutral-500 hover:text-neutral-300`}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            <Field
                                light
                                label={'New Password'}
                                name={'password'}
                                type={showPassword ? 'text' : 'password'}
                                description={'Passwords must be at least 8 characters in length.'}
                                className={'pl-10 pr-10'}
                            />
                        </div>
                    </div>
                    <div css={tw`mt-6`}>
                        <div css={tw`relative`}>
                            <Lock css={tw`absolute left-3 top-11 z-10 h-4 w-4 text-neutral-500`} />
                            <button
                                type={'button'}
                                onClick={() => setShowPasswordConfirmation((s) => !s)}
                                css={tw`absolute right-3 top-10 z-10 text-neutral-500 hover:text-neutral-300`}
                            >
                                {showPasswordConfirmation ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            <Field
                                light
                                label={'Confirm New Password'}
                                name={'passwordConfirmation'}
                                type={showPasswordConfirmation ? 'text' : 'password'}
                                className={'pl-10 pr-10'}
                            />
                        </div>
                    </div>
                    <div css={tw`mt-6`}>
                        <Button size={'xlarge'} type={'submit'} disabled={isSubmitting} isLoading={isSubmitting}>
                            Reset Password
                        </Button>
                    </div>
                    <div css={tw`mt-6 text-center`}>
                        <Link
                            to={'/auth/login'}
                            css={tw`text-xs text-neutral-500 tracking-wide no-underline uppercase hover:text-neutral-600`}
                        >
                            Return to Login
                        </Link>
                    </div>
                </LoginFormContainer>
            )}
        </Formik>
    );
};
