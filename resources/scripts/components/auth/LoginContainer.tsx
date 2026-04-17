import React, { useEffect, useRef, useState } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import login from "@/api/auth/login";
import LoginFormContainer from "@/components/auth/LoginFormContainer";
import { useStoreState } from "easy-peasy";
import { Formik, FormikHelpers } from "formik";
import { object, string } from "yup";
import Field from "@/components/elements/Field";
import tw from "twin.macro";
import { Button } from "@/components/elements/button/index";
import Reaptcha from "reaptcha";
import useFlash from "@/plugins/useFlash";

interface Values {
  username: string;
  password: string;
}

const LoginContainer = ({ history }: RouteComponentProps) => {
  const ref = useRef<Reaptcha>(null);
  const [token, setToken] = useState("");

  const { clearFlashes, clearAndAddHttpError } = useFlash();
  const { enabled: recaptchaEnabled, siteKey } = useStoreState(
    (state) => state.settings.data!.recaptcha
  );

  useEffect(() => {
    clearFlashes();
  }, []);

  const onSubmit = (
    values: Values,
    { setSubmitting }: FormikHelpers<Values>
  ) => {
    clearFlashes();

    // If there is no token in the state yet, request the token and then abort this submit request
    // since it will be re-submitted when the recaptcha data is returned by the component.
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
          window.location = response.intended || "/";
          return;
        }

        history.replace("/auth/login/checkpoint", {
          token: response.confirmationToken,
        });
      })
      .catch((error) => {
        console.error(error);

        setToken("");
        if (ref.current) ref.current.reset();

        setSubmitting(false);
        clearAndAddHttpError({ error });
      });
  };

  return (
    <div css={tw`absolute top-0`}>
      <div
        css={tw`w-screen h-screen flex items-center justify-center bg-elysium-color1`}
      >
        <Formik
          onSubmit={onSubmit}
          initialValues={{ username: "", password: "" }}
          validationSchema={object().shape({
            username: string().required(
              "A username or email must be provided."
            ),
            password: string().required("Please enter your account password."),
          })}
        >
          {({ isSubmitting, setSubmitting, submitForm }) => (
            <LoginFormContainer
              title={"Login to Continue"}
              css={tw`w-full flex`}
            >
              <Field
                type={"text"}
                label={"Username or Email"}
                name={"username"}
                disabled={isSubmitting}
              />
              <div css={tw`mt-6`}>
                <Field
                  type={"password"}
                  label={"Password"}
                  name={"password"}
                  disabled={isSubmitting}
                />
              </div>
              {recaptchaEnabled && (
                <Reaptcha
                  ref={ref}
                  size={"invisible"}
                  sitekey={siteKey || "_invalid_key"}
                  onVerify={(response) => {
                    setToken(response);
                    submitForm();
                  }}
                  onExpire={() => {
                    setSubmitting(false);
                    setToken("");
                  }}
                />
              )}
              <div css={tw`mt-4`}>
                <div>
                  <Button
                    css={tw`w-full my-2 overflow-hidden whitespace-nowrap`}
                    type={"submit"}
                    disabled={isSubmitting}
                  >
                    Login
                  </Button>
                </div>
                <div>
                  <Link to={`/auth/password`}>
                    <Button.Danger
                      css={tw`w-full my-2 overflow-hidden whitespace-nowrap`}
                    >
                      Forgot Password
                    </Button.Danger>
                  </Link>
                </div>
              </div>
            </LoginFormContainer>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default LoginContainer;
