import { CancelToken, Cancel } from "axios";
import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { gte } from "semver";

import LockOutlinedIcon from "@material-ui/icons/LockOutlined";

import LoadingIndicator from "../LoadingIndicator/LoadingIndicator.jsx";

import useDebounce from "../../../hooks/useDebounce.js";
import { getInfo } from "../../../utils/api.js";
import { minServerVersion } from "../../../utils/constants.js";

const ServerValidIndicator = ({ setValid, setLocked = null, show = true }) => {
  const serverAddress = useSelector((state) => state.login.serverAddress);
  const debouncedServerAddress = useDebounce(serverAddress, 500);

  const [isLoading, setIsLoading] = useState(true);
  const [isValidServer, setIsValidServer] = useState(null);
  const [isValidVersion, setIsValidVersion] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isServerResponding, setIsServerResponding] = useState(null);
  const [serverVersion, setServerVersion] = useState(null);

  const timer = useRef(null);

  const { t } = useTranslation();

  useEffect(() => {
    setIsLoading(true);
    setIsValidServer(null);
    setIsValidVersion(null);
    setServerVersion(null);
    setIsLocked(null);
  }, [serverAddress]);

  useEffect(() => {
    setIsLoading(true);
    setIsValidServer(null);
    setIsValidVersion(null);
    setServerVersion(null);
    setIsLocked(null);

    const cancelToken = CancelToken.source();

    getInfo(cancelToken.token)
      .then((res) => {
        setIsValidServer(res?.data?.identifier === "vocascan-server");
        setIsLocked(res?.data?.locked);
        setIsValidVersion(gte(res?.data?.version, minServerVersion));
        setServerVersion(res?.data?.version);
        setIsServerResponding(true);
      })
      .catch((err) => {
        if (!(err instanceof Cancel)) {
          setIsServerResponding(false);
        }
      })
      .finally(() => {
        timer.current = setTimeout(() => setIsLoading(false), 500);
      });

    return () => {
      cancelToken.cancel();
      setIsLoading(false);
    };
  }, [debouncedServerAddress]);

  useEffect(() => {
    setValid(
      isValidServer === true &&
        isValidVersion === true &&
        isServerResponding === true
    );
  }, [
    setValid,
    isValidServer,
    isValidVersion,
    isServerResponding,
    setLocked,
    isLocked,
  ]);

  useEffect(() => {
    setLocked?.(isLocked);
  }, [isLocked, setLocked]);

  useEffect(() => {
    return () => {
      clearTimeout(timer.current);
    };
  }, []);

  if (isLoading && serverAddress !== "") {
    return <LoadingIndicator position="center" />;
  }

  return (
    <div className="-mt-1 text-xs">
      {isValidServer === true &&
        isValidVersion === true &&
        isServerResponding === true &&
        show && (
          <p className="h-7 text-right text-green-dark flex justify-end items-center">
            {t("components.validServerIndicator.validServer", {
              version: serverVersion,
            })}

            {isLocked && <LockOutlinedIcon className="ml-1" fontSize="small" />}
          </p>
        )}

      {isValidServer === false && (
        <p className="h-7 text-right text-red-dark">
          {t("components.validServerIndicator.serverNotVocascanServer")}
        </p>
      )}

      {isValidVersion === false && (
        <p className="h-7 text-right text-red-dark">
          {t("components.validServerIndicator.versionToOld", {
            version: serverVersion,
            minVersion: minServerVersion,
          })}
        </p>
      )}

      {isServerResponding === false && serverAddress !== "" && (
        <p className="h-7 text-right text-red-dark">
          {t("components.validServerIndicator.serverNotResponding")}
        </p>
      )}
    </div>
  );
};

export default ServerValidIndicator;
