import React, { useCallback, useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

import Button from "../../Components/Button/Button.jsx";
import ArrayTextInput from "../../Components/Form/ArrayTextInput/ArrayTextInput.jsx";
import Select, {
  SelectOptionWithFlag,
} from "../../Components/Form/Select/Select.jsx";
import Switch from "../../Components/Form/Switch/Switch.jsx";
import TextInput from "../../Components/Form/TextInput/TextInput.jsx";
import Textarea from "../../Components/Form/Textarea/Textarea.jsx";
import Modal from "../../Components/Modal/Modal.jsx";
import GroupForm from "../../Forms/GroupForm/GroupForm.jsx";
import PackageForm from "../../Forms/PackageForm/PackageForm.jsx";

import useSnack from "../../hooks/useSnack.js";
import { setVocabActive, setVocabActivate } from "../../redux/Actions/form.js";
import {
  getPackages,
  createVocabulary,
  modifyVocabulary,
} from "../../utils/api.js";
import {
  maxTextareaLength,
  maxTextfieldLength,
} from "../../utils/constants.js";
import { maxTranslations } from "../../utils/constants.js";

const VocabForm = ({
  defaultData = null,
  onSubmitCallback = null,
  title = null,
  packageId = null,
  groupId = null,
  onLoad = null,
  canSave = true,
  clearOnSubmit = true,
}) => {
  const { t } = useTranslation();
  const { showSnack } = useSnack();
  const dispatch = useDispatch();
  const focusedInputField = useRef();

  const active = useSelector((state) => state.form.vocab.active);
  const activate = useSelector((state) => state.form.vocab.activate);

  const [localActive, setLocalActive] = useState(
    defaultData ? defaultData.active : active
  );
  const [localActivate, setLocalActivate] = useState(
    defaultData ? defaultData.activate : activate
  );

  const [packages, setPackages] = useState([]);
  const [packageItems, setPackageItems] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const [groups, setGroups] = useState([]);
  const [groupsItems, setGroupsItems] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const [foreignWord, setForeignWord] = useState(
    defaultData ? defaultData.name : ""
  );
  const [translations, setTranslations] = useState(
    defaultData
      ? defaultData.Translations.map((elem) => {
          return {
            id: elem.id,
            value: elem.name,
          };
        })
      : [""]
  );
  const [description, setDescription] = useState(
    defaultData ? defaultData.description : ""
  );

  const [showAddPackage, setShowAddPackage] = useState(false);
  const [showAddGroup, setShowAddGroup] = useState(false);

  const onChangeActive = useCallback(() => {
    setLocalActive((act) => !act);
  }, []);

  const onChangeActivate = useCallback(() => {
    setLocalActivate((acte) => !acte);
  }, []);

  const fetchPackages = useCallback(() => {
    getPackages(true)
      .then(({ data }) => {
        setPackages(data);
      })
      .catch((err) => {
        showSnack("error", t("global.fetchError"));
      });
  }, [showSnack, t]);

  const onClear = useCallback(() => {
    setForeignWord("");
    setDescription("");
    setTranslations(null);
  }, [setForeignWord, setTranslations]);

  const openPackageModal = useCallback(() => {
    setShowAddPackage(true);
  }, []);

  const openGroupModal = useCallback(() => {
    setShowAddGroup(true);
  }, []);

  const closePackageModal = useCallback(() => {
    setShowAddPackage(false);
  }, []);

  const closeGroupModal = useCallback(() => {
    setShowAddGroup(false);
  }, []);

  const packageAdded = useCallback(
    (newPackage) => {
      setSelectedPackage({
        value: newPackage.id,
        label: (
          <SelectOptionWithFlag
            name={newPackage.name}
            foreignLanguageCode={newPackage.foreignWordLanguage}
            translatedLanguageCode={newPackage.translatedWordLanguage}
          />
        ),
      });
      closePackageModal();
      fetchPackages();
    },
    [closePackageModal, fetchPackages]
  );

  const groupAdded = useCallback(
    (newGroup) => {
      closeGroupModal();
      fetchPackages();
      setSelectedGroup({ value: newGroup.id, label: newGroup.name });
    },
    [closeGroupModal, fetchPackages]
  );

  const onSubmit = useCallback(() => {
    const submitTranslations = translations.map((elem) => {
      return {
        name: elem,
      };
    });

    const dataToSubmit = {
      name: foreignWord,
      translations: submitTranslations,
      active: localActive,
      description,
    };

    if (defaultData?.id) {
      dataToSubmit.id = defaultData.id;

      modifyVocabulary(dataToSubmit)
        .then((response) => {
          onClear();
          showSnack("success", t("components.vocabForm.modifySuccessMessage"));
          onSubmitCallback && onSubmitCallback();
        })
        .catch((e) => {
          showSnack("error", t("components.vocabForm.modifyErrorMessage"));
        });

      return;
    }

    createVocabulary(
      selectedPackage.value,
      selectedGroup.value,
      dataToSubmit,
      localActivate
    )
      .then((response) => {
        if (clearOnSubmit) {
          onClear();
        }
        dispatch(setVocabActive({ active: localActive }));
        dispatch(setVocabActivate({ activate: localActivate }));
        showSnack("success", t("components.vocabForm.saveSuccessMessage"));
        onSubmitCallback && onSubmitCallback(response.data);
      })
      .catch((e) => {
        showSnack("error", t("components.vocabForm.saveErrorMessage"));
      });
    focusedInputField.current.focus();
  }, [
    translations,
    foreignWord,
    localActive,
    description,
    defaultData?.id,
    selectedPackage?.value,
    selectedGroup?.value,
    localActivate,
    onClear,
    showSnack,
    t,
    onSubmitCallback,
    clearOnSubmit,
    dispatch,
  ]);

  useEffect(() => {
    if (defaultData) {
      dispatch(setVocabActive({ active: defaultData.active }));
      dispatch(setVocabActivate({ activate: defaultData.activate }));
    }
  }, [defaultData, dispatch]);

  useEffect(() => {
    fetchPackages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (packageId && packages.length) {
      setSelectedPackage(() => {
        const newPackage = packages.find((elem) => elem.id === packageId);

        return {
          value: packageId,
          label: (
            <SelectOptionWithFlag
              name={newPackage.name}
              foreignLanguageCode={newPackage.foreignWordLanguage}
              translatedLanguageCode={newPackage.translatedWordLanguage}
            />
          ),
        };
      });
    }
  }, [packages, packageId]);

  useEffect(() => {
    if (groupId && groups.length) {
      setSelectedGroup(() => {
        return {
          value: groupId,
          label: groups.find((elem) => elem.id === groupId).name,
        };
      });
    }
  }, [groups, groupId]);

  useEffect(() => {
    if (!selectedPackage) {
      return;
    }

    const grps = packages.find((p) => p.id === selectedPackage.value);

    setGroups(() => {
      if (!grps) {
        return [];
      }

      return grps.Groups;
    });

    setSelectedGroup((grp) => {
      if (!grp || !grps) {
        return null;
      }

      const contain = grps.Groups.find((g) => g.id === grp.value);

      if (!contain) {
        return null;
      }

      return grp;
    });
  }, [packages, selectedPackage]);

  useEffect(() => {
    setPackageItems(() =>
      packages.map((p) => {
        return {
          value: p.id,
          label: (
            <SelectOptionWithFlag
              name={p.name}
              foreignLanguageCode={p.foreignWordLanguage}
              translatedLanguageCode={p.translatedWordLanguage}
            />
          ),
        };
      })
    );
  }, [packages]);

  useEffect(() => {
    setGroupsItems(() =>
      groups.map((g) => {
        return {
          value: g.id,
          label: g.name,
        };
      })
    );
  }, [groups]);

  useEffect(() => {
    onLoad && onLoad();
  }, [onLoad]);

  return (
    <>
      <form
        className="w-full h-3/4 p-12 overflow-y-auto md:max-w-3xl"
        onSubmit={onSubmit}
      >
        {title && <h1 className="hidden md:inline">{title}</h1>}

        <div className="z-10 md:max-h-12 md:flex md:justify-between md:my-5 md:-mx-2.5">
          <div className="w-full md:my-0 md:mx-2.5">
            <Select
              required
              creatable
              disabled={packageId}
              createText={t("components.vocabForm.packageCreateText")}
              onCreate={openPackageModal}
              tabIndex={-1}
              label={t("global.package")}
              options={packageItems}
              onChange={(v) => {
                setSelectedPackage(v);
              }}
              value={selectedPackage}
              noOptionsMessage={t("components.vocabForm.noPackagesMessage")}
            />
          </div>
          <div className="w-full md:my-0 md:mx-2.5">
            <Select
              required
              creatable
              createText={t("components.vocabForm.groupCreateText")}
              onCreate={openGroupModal}
              disabled={!selectedPackage || groupId}
              tabIndex={-1}
              label={t("global.group")}
              options={groupsItems}
              onChange={(v) => {
                setSelectedGroup(v);
              }}
              value={selectedGroup}
              noOptionsMessage={t("components.vocabForm.noGroupsMessage")}
            />
          </div>
        </div>
        <div className="flex flex-col">
          <TextInput
            required
            inputRef={focusedInputField}
            tabIndex={1}
            placeholder={t("global.foreignWord")}
            onChange={(value) => {
              setForeignWord(value);
            }}
            value={foreignWord}
            maxLength={maxTextfieldLength}
          />
          <ArrayTextInput
            max={maxTranslations}
            data={translations}
            placeholder={t("global.translation")}
            onChange={setTranslations}
            addText={t("components.vocabForm.addTranslation")}
            inputProps={{
              maxLength: maxTextfieldLength,
              required: true,
            }}
          />
          <Textarea
            tabIndex={1}
            placeholder={t("global.description")}
            onChange={(value) => {
              setDescription(value);
            }}
            value={description}
            rows={5}
            maxLength={maxTextareaLength}
          />
          <Switch
            tabIndex={-1}
            appearance="on-off"
            optionLeft={t("components.vocabForm.activeLabel")}
            infoLeft={t("components.vocabForm.activeTooltip")}
            onChange={onChangeActive}
            checked={localActive}
          />
          {!defaultData && (
            <Switch
              tabIndex={-1}
              appearance="on-off"
              optionLeft={t("components.vocabForm.activateLabel")}
              infoLeft={t("components.vocabForm.activateTooltip")}
              onChange={onChangeActivate}
              checked={localActivate}
            />
          )}
        </div>

        <div className="w-1/3 my-0 mx-auto flex justify-center mt-10">
          <Button
            block
            tabIndex={-1}
            type="submit"
            disabled={
              !(
                foreignWord &&
                translations?.length &&
                selectedGroup &&
                selectedPackage &&
                canSave
              )
            }
          >
            {t("global.submit")}
          </Button>
        </div>
      </form>
      <Modal
        title={t("screens.allPackages.addPackage")}
        open={showAddPackage}
        onClose={closePackageModal}
      >
        <PackageForm onSubmitCallback={packageAdded} />
      </Modal>
      <Modal
        title={t("screens.allGroups.addGroup")}
        open={showAddGroup}
        onClose={closeGroupModal}
      >
        <GroupForm
          fixedPackage
          selectedPackage={selectedPackage}
          onSubmitCallback={groupAdded}
        />
      </Modal>
    </>
  );
};

export default VocabForm;
