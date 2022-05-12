import React, { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import Button from "../Button/Button.jsx";
import Flag from "../Flag/Flag.jsx";

import useLanguage from "../../hooks/useLanguage.js";
import {
  touchbarSelect,
  available as touchBarAvailable,
  touchbarReset,
} from "../../modules/touchbar.js";

import "./VocabCard.scss";

const RenderForeignWord = ({ currVocab, isTranslation }) => {
  const foreignWordLanguage = useSelector(
    (state) => state.query.foreignWordLanguage
  );
  const language = useLanguage(foreignWordLanguage);

  return (
    <div className="foreign-word-wrapper">
      {isTranslation ? (
        <p className="description text-wrap">{currVocab.description}</p>
      ) : null}
      <h1 className={`${isTranslation ? "translations" : ""}`}>
        {currVocab.name}
      </h1>
      <div className="language-indicator">
        <p>{language?.nativeNames[0]}</p>
        <small className="postfix">
          <Flag languageCode={foreignWordLanguage} size="small" border />
        </small>
      </div>
    </div>
  );
};

const RenderTranslatedWord = ({ currVocab, isTranslation }) => {
  const translatedWordLanguage = useSelector(
    (state) => state.query.translatedWordLanguage
  );
  const language = useLanguage(translatedWordLanguage);

  return (
    <div className="translated-word-wrapper">
      {isTranslation ? (
        <p className="my-20 text-wrap">{currVocab.description}</p>
      ) : null}
      <div className={`my-20 ${isTranslation ? "translations" : ""}`}>
        {currVocab.Translations.map((el) => el.name).join(", ")}
      </div>
      <div className="language-indicator">
        <p>{language?.nativeNames[0]}</p>
        <small className="postfix">
          <Flag languageCode={translatedWordLanguage} size="small" border />
        </small>
      </div>
    </div>
  );
};

const VocabCard = ({
  currVocab,
  onCorrect = () => null,
  onWrong = () => null,
  onFlip = () => null,
  currDirection = "default",
  disabled = false,
}) => {
  const { t } = useTranslation();
  const [flip, setFlip] = useState(false);

  const onFlipHandler = useCallback(() => {
    setFlip((prev) => {
      onFlip(!prev);
      return !prev;
    });
  }, [onFlip]);

  useEffect(() => {
    if (touchBarAvailable) {
      touchbarSelect({
        options: [
          {
            id: 0,
            label: t("global.wrong"),
            accessibilityLabel: "Select",
            backgroundColor: "#ff586e",
          },
          {
            id: 1,
            label: t("global.correct"),
            accessibilityLabel: "Select",
            backgroundColor: "#0acf97",
          },
        ],
      }).then(([err, x]) => {
        // return if error -> not supported
        if (err) return;

        if (x.id === 0) onWrong();
        else if (x.id === 1) onCorrect();
      });

      return () => touchbarReset();
    }

    return () => {};
  }, [onCorrect, onWrong, t]);

  return (
    <div className="vocab-card">
      <div className={`card-inner ${flip ? "flipped" : ""}`}>
        <div className="card-front" onClick={onFlipHandler}>
          <div className="card-front-inner">
            {currDirection === "default" ? (
              <RenderForeignWord currVocab={currVocab} isTranslation={false} />
            ) : (
              <RenderTranslatedWord
                currVocab={currVocab}
                isTranslation={false}
              />
            )}
          </div>
        </div>
        <div className="card-back" onClick={onFlipHandler}>
          <div className="card-back-inner">
            {currDirection === "default" ? (
              <RenderTranslatedWord
                currVocab={currVocab}
                isTranslation={true}
              />
            ) : (
              <RenderForeignWord currVocab={currVocab} isTranslation={true} />
            )}
            <div className="continue">
              <Button
                className="card-button"
                appearance="red"
                disabled={disabled}
                onClick={onWrong}
              >
                {t("global.wrong")}
              </Button>
              <Button
                className="card-button"
                appearance="green"
                disabled={disabled}
                onClick={onCorrect}
              >
                {t("global.correct")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VocabCard;
