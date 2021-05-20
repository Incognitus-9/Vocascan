import React from "react";
import { useTranslation } from "react-i18next";

import image1 from "./addVocab.png";

import "./VocabDescription.scss";

const VocabDescription = () => {
  const { t } = useTranslation();
  const bulletPoints = t("screens.guide.vocabDescription.bulletPoints", {
    returnObjects: true,
  });
  return (
    <div className="vocabDescription">
      <div className="images">
        <img src={image1} alt="" />
      </div>
      <div className="description">
        <p>{t("screens.guide.vocabDescription.heading")}</p>
        <ul>
          {bulletPoints.map((bulletPoint, index) => (
            <li key={index}>{bulletPoint}</li>
          ))}
        </ul>
        <p>{t("screens.guide.vocabDescription.endText")}</p>
      </div>
    </div>
  );
};

export default VocabDescription;