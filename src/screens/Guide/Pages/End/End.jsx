import React from "react";
import { useTranslation } from "react-i18next";

import "./End.scss";

const End = () => {
  const { t } = useTranslation();

  return (
    <div className={"end"}>
      <div className={"end-heading"}>
        <h1>{t("screens.guide.end.heading")}</h1>
        <p>{t("screens.guide.end.description")}</p>
      </div>
    </div>
  );
};

export default End;