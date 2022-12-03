import React, { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { useHistory } from "react-router-dom";

import ProgressBar from "../../../Components/Charts/ProgressBar/ProgressBar.jsx";
import VocabCard from "../../../Components/VocabCard/VocabCard.jsx";

import useSnack from "../../../hooks/useSnack.js";
import {
  setQueryCorrect,
  setQueryWrong,
  setActualProgress,
} from "../../../redux/Actions/query.js";
import { getQueryVocabulary, checkQuery } from "../../../utils/api.js";

import "./Query.scss";

const Query = () => {
  const { showSnack } = useSnack();
  const { direction } = useParams();
  const dispatch = useDispatch();
  const history = useHistory();

  const languagePackageId = useSelector(
    (state) => state.query.languagePackageId
  );
  const staged = useSelector((state) => state.query.staged);
  const groupIds = useSelector((state) => state.query.groupIds);
  const limit = useSelector((state) => state.query.vocabsToday);
  const customLearning = useSelector((state) => state.query.customLearning);

  const [vocabs, setVocabs] = useState([]);
  const [vocabSize, setVocabSize] = useState(0);
  const [currVocab, setCurrVocab] = useState(null);
  const correctVocabs = useSelector((state) => state.query.correct);
  const wrongVocabs = useSelector((state) => state.query.wrong);
  const actualProgress = useSelector((state) => state.query.actualProgress);
  const [loaded, setLoaded] = useState(false);
  const [currDirection, setCurrDirection] = useState(direction);
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const getVocabulary = useCallback(() => {
    const onlyActivated = !staged && groupIds;
    getQueryVocabulary(
      languagePackageId,
      staged,
      onlyActivated,
      limit,
      groupIds
    )
      .then((response) => {
        //store stats
        setVocabs(response.data);
        setVocabSize(response.data.length);
      })
      .catch((event) => {
        if (event.response?.status === 401 || event.response?.status === 404) {
          showSnack("error", "Error fetching stats");
          return;
        }

        showSnack("error", "Internal Server Error");
      });
  }, [groupIds, languagePackageId, limit, showSnack, staged]);

  const sendVocabCheck = useCallback(
    (vocabularyCardId, answer, progress) => {
      // send result to server

      // if custom learning disable sending progress to server
      if (customLearning) {
        checkQuery(vocabularyCardId, answer, progress).catch((event) => {
          if (
            event.response?.status === 401 ||
            event.response?.status === 404
          ) {
            showSnack("error", "Error fetching stats");
            return;
          }

          showSnack("error", "Internal Server Error");
        });
      }

      setButtonDisabled(true);
      setTimeout(() => setButtonDisabled(false), 260);

      if (direction === "random") {
        setCurrDirection(
          Math.floor(Math.random() * 2) % 2 ? "default" : "backwards"
        );
      }

      //if answer is right and wrong vocabs haven't been repeated yet
      if (answer && wrongVocabs + correctVocabs < vocabSize) {
        dispatch(setQueryCorrect());
        dispatch(setActualProgress());
      }
      // if wrong vocabs get repeated, stop increment wrong or correct. Only increment counter for progress bar
      else if (answer) {
        dispatch(setActualProgress());
      }
      // if answer is wrong an wrong vocabs haven't been repeated yet, increment wrong counter
      else if (!answer && wrongVocabs + correctVocabs < vocabSize) {
        dispatch(setQueryWrong());
      }

      // if answer is correct shift the first card out of the array
      if (answer) {
        setVocabs(vocabs.slice(1));
      }
      // if answer is wrong put vocab card to the end of the query
      else {
        setVocabs([...vocabs.slice(1), vocabs[0]]);
      }
    },
    [
      customLearning,
      direction,
      wrongVocabs,
      correctVocabs,
      vocabSize,
      showSnack,
      dispatch,
      vocabs,
    ]
  );

  useEffect(() => {
    if (direction === "random") {
      setCurrDirection(
        Math.floor(Math.random() * 2) % 2 ? "default" : "backwards"
      );
    }

    setLoaded(true);
  }, [direction]);

  useEffect(() => {
    if (!vocabs) {
      return;
    }
    let timer1 = setTimeout(() => setCurrVocab(vocabs[0]), 260);

    return () => {
      clearTimeout(timer1);
    };
  }, [vocabs]);

  useEffect(() => {
    if (actualProgress > 0 && vocabs.length === 0) {
      history.push("/learn/end/");
    }
  }, [actualProgress, vocabs, history]);

  useEffect(() => {
    getVocabulary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <div className="query-wrapper">
      <div className="progress">
        <ProgressBar value={actualProgress} max={vocabSize} bottomText={true} />
      </div>
      <div className="content">
        {currVocab && (
          <VocabCard
            currVocab={currVocab}
            onCorrect={() => sendVocabCheck(currVocab.id, true, true)}
            onWrong={() => sendVocabCheck(currVocab.id, false, true)}
            disabled={buttonDisabled}
            currDirection={currDirection}
          />
        )}
      </div>
    </div>
  );
};

export default Query;
