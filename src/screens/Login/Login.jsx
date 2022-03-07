import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import ArrowBackIcon from "@material-ui/icons/ArrowBack";

import Button from "../../Components/Button/Button.jsx";
import TextInput from "../../Components/Form/TextInput/TextInput.jsx";
import ServerValidIndicator from "../../Components/Indicators/ServerValidIndicator/ServerValidIndicator.jsx";
import UnauthenticatedLayout from "../../Components/Layout/UnauthenticatedLayout/UnauthenticatedLayout.jsx";

import { setLanguages } from "../../redux/Actions/language.js";
import { setServerUrl, signIn } from "../../redux/Actions/login.js";
import { login, getLanguages } from "../../utils/api.js";
import { maxTextfieldLength } from "../../utils/constants.js";

const Login = ({ image }) => {
  const { t } = useTranslation();

  const serverAddress = useSelector((state) => state.login.serverAddress);
  const selfHosted = useSelector((state) => state.login.selfHosted);
  const languages = useSelector((state) => state.language.languages);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [serverAddressInput, setServerAddressInput] = useState(serverAddress);
  const [error, setError] = useState(false);
  const [serverError, setServerError] = useState(false);
  const [isServerValid, setIsServerValid] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);

  const { SHOW_PLANS: showPlans, BASE_URL: baseURL } = window.VOCASCAN_CONFIG;

  const dispatch = useDispatch();

  const history = useHistory();

  const handleClickRegister = useCallback(() => {
    history.push("/register");
  }, [history]);

  //fetch languages
  const fetchLanguages = useCallback(() => {
    // when array is empty no languages were stored. Then add them to the store
    if (languages.length === 0) {
      getLanguages({ nativeNames: true }).then((res) => {
        dispatch(
          setLanguages({
            languages: res.data,
          })
        );
      });
    }
  }, [dispatch, languages.length]);

  //make api call to login
  const submitLogin = useCallback(
    async (e) => {
      e.preventDefault();

      if (!canSubmit) {
        return;
      }

      login({
        email,
        password,
      })
        .then((response) => {
          setError(false);

          //store username, email and jwt token in redux store
          dispatch(
            signIn({
              username: response.data.user.username,
              email,
              token: response.data.token,
              isAdmin: response.data.user.isAdmin,
            })
          );
          //fetch languages from server
          fetchLanguages();
        })
        .catch((event) => {
          if (
            event.response?.status === 401 ||
            event.response?.status === 404
          ) {
            setServerError(false);
            setError(true);
            return;
          }

          setServerError(true);
        });
    },
    [canSubmit, dispatch, email, fetchLanguages, password]
  );

  useEffect(() => {
    if (selfHosted && !serverAddress) {
      setCanSubmit(false);

      return;
    }

    setCanSubmit(!(!email || !password || !isServerValid));
  }, [email, password, selfHosted, serverAddress, isServerValid]);

  useEffect(() => {
    try {
      if (!selfHosted) {
        return;
      }

      const { origin } = new URL(serverAddressInput);

      dispatch(setServerUrl({ serverAddress: origin }));
    } catch (err) {}
  }, [dispatch, selfHosted, serverAddressInput]);

  return (
    <UnauthenticatedLayout>
      <div className="max-w-md max-h-[550px] m-auto rounded-xl relative flex flex-col justify-around py-10 px-24 bg-white shadow-2xl">
        {showPlans && (
          <ArrowBackIcon
            className="absolute top-5 left-5 text-primary-standard hover:cursor-pointer hover:text-primary-dark-standard"
            onClick={() => history.push("/plans")}
          />
        )}
        <div className="w-full h-2/6">
          <img
            className="w-24 h-auto mb-3 mx-auto"
            src={image}
            alt="server-logo"
          />
          <h1 className="uppercase text-2xl">{t("screens.login.title")}</h1>
        </div>
        <form onSubmit={submitLogin}>
          <div className="w-full min-w-[250px] my-7 mx-auto flex flex-col justify-around">
            <TextInput
              autoFocus
              required
              placeholder={t("global.email")}
              onChange={(value) => {
                setError(false);
                setEmail(value);
              }}
              value={email}
              maxLength={maxTextfieldLength}
            />
            <TextInput
              required
              type="password"
              placeholder={t("global.password")}
              autoComplete="current-password"
              onChange={(value) => {
                setError(false);
                setPassword(value);
              }}
              value={password}
              error={error}
              errorText={t("screens.login.wrongCredentials")}
              maxLength={maxTextfieldLength}
            />
            {selfHosted && !baseURL && (
              <TextInput
                required
                placeholder={t("global.server")}
                onChange={(value) => {
                  setServerError(false);
                  setServerAddressInput(value);
                }}
                value={serverAddressInput}
                maxLength={maxTextfieldLength}
              />
            )}
            {serverError ? (
              <p className="text-right -mt-1 h-7 text-xs text-red-standard">
                {t("global.serverNotResponding")}
              </p>
            ) : (
              <ServerValidIndicator
                setValid={setIsServerValid}
                show={!baseURL}
              />
            )}
          </div>
          <div className="flex flex-col justify-center my-5 mx-0">
            <Button block uppercase onClick={submitLogin} disabled={!canSubmit}>
              {t("global.signIn")}
            </Button>
            <div className="flex flex-row justify-center text-sm mt-3">
              {t("screens.login.dontHaveAccount")}{" "}
              <div
                className="text-primary-standard ml-1 cursor-pointer"
                onClick={handleClickRegister}
              >
                {t("global.signUp")}
              </div>
            </div>
          </div>
        </form>
      </div>
    </UnauthenticatedLayout>
  );
};

export default Login;
