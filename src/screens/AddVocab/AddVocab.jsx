import React, { useCallback, useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";

import ArrayTextInput from "../../Components/ArrayTextInput/ArrayTextInput.jsx";
import Button from "../../Components/Button/Button.jsx";
import GroupForm from "../../Components/GroupForm/GroupForm.jsx";
import Modal from "../../Components/Modal/Modal.jsx";
import PackageForm from "../../Components/PackageForm/PackageForm.jsx";
import Select from "../../Components/Select/Select.jsx";
import Switch from "../../Components/Switch/Switch.jsx";
import TextInput from "../../Components/TextInput/TextInput.jsx";
import SnackbarContext from "../../context/SnackbarContext.jsx";

import { getPackages, createVocabulary } from "../../utils/api.js";
import { languages, maxTranslations } from "../../utils/constants.js";

import "./AddVocab.scss";

const CustomSelectOption = ({ name, postfix }) => {
  return (
    <span className="custom-option-wrapper">
      {name}
      <small className="postfix">{postfix}</small>
    </span>
  );
};

const AddVocab = () => {
  const { t } = useTranslation();
  const { showSnack } = useContext(SnackbarContext);

  const [packages, setPackages] = useState([]);
  const [packageItems, setPackageItems] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const [groups, setGroups] = useState([]);
  const [groupsItems, setGroupsItems] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const [foreignWord, setForeignWord] = useState("");
  const [translations, setTranslations] = useState([]);
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [showAddPackage, setShowAddPackage] = useState(false);
  const [showAddGroup, setShowAddGroup] = useState(false);

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
    setSelectedPackage(null);
    setSelectedGroup(null);
    setForeignWord("");
    setDescription("");
    setTranslations(null);
  }, [setSelectedPackage, setSelectedGroup, setForeignWord, setTranslations]);

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
      setSelectedPackage({ value: newPackage.id, label: newPackage.name });
      closePackageModal();
      fetchPackages();
      showSnack("success", t("screens.addVocab.savePackageSuccessMessage"));
    },
    [closePackageModal, fetchPackages, t, showSnack]
  );

  const groupAdded = useCallback(
    (newGroup) => {
      closeGroupModal();
      fetchPackages();
      setSelectedGroup({ value: newGroup.id, label: newGroup.name });
      showSnack("success", t("screens.addVocab.saveGroupSuccessMessage"));
    },
    [closeGroupModal, fetchPackages, t, showSnack]
  );

  const onSubmit = useCallback(() => {
    const submitTranslations = translations.map((elem) => {
      return {
        name: elem,
      };
    });

    createVocabulary(
      selectedPackage.value,
      selectedGroup.value,
      {
        name: foreignWord,
        translations: submitTranslations,
        description,
      },
      active
    )
      .then((response) => {
        onClear();
        showSnack("success", t("screens.addVocab.saveSuccessMessage"));
      })
      .catch((e) => {
        showSnack("error", t("screens.addVocab.saveSuccessMessage"));
      });
  }, [
    active,
    description,
    selectedGroup,
    selectedPackage,
    foreignWord,
    translations,
    onClear,
    showSnack,
    t,
  ]);

  useEffect(() => {
    fetchPackages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        const foreignIcon = languages.find(
          (x) => x.name === p.foreignWordLanguage
        ).icon;
        const translatedIcon = languages.find(
          (x) => x.name === p.translatedWordLanguage
        ).icon;

        return {
          value: p.id,
          label: (
            <CustomSelectOption
              name={p.name}
              postfix={foreignIcon + " - " + translatedIcon}
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

  return (
    <>
      <div className="add-vocab-form">
        <h1 className="heading">{t("screens.addVocab.title")}</h1>

        <div className="dropdowns">
          <div className="select-wrapper">
            <Select
              required
              creatable
              createText={"Create new Package"}
              onCreate={openPackageModal}
              tabIndex={1}
              label={t("global.package")}
              options={packageItems}
              onChange={(v) => {
                setSelectedPackage(v);
              }}
              value={selectedPackage}
              noOptionsMessage={t("screens.addVocab.noPackagesMessage")}
            />
          </div>
          <div className="select-wrapper">
            <Select
              required
              creatable
              createText={"Create new Group"}
              onCreate={openGroupModal}
              disabled={!selectedPackage}
              tabIndex={1}
              label={t("global.group")}
              options={groupsItems}
              onChange={(v) => {
                setSelectedGroup(v);
              }}
              value={selectedGroup}
              noOptionsMessage={t("screens.addVocab.noGroupsMessage")}
            />
          </div>
        </div>
        <div className="input-fields">
          <TextInput
            required
            tabIndex={1}
            placeholder={t("global.foreignWord")}
            onChange={(value) => {
              setForeignWord(value);
            }}
            value={foreignWord}
          />
          <ArrayTextInput
            required
            max={maxTranslations}
            data={translations}
            placeholder={t("global.translation")}
            onChange={setTranslations}
            addText={t("screens.addVocab.addTranslation")}
          />
          <TextInput
            tabIndex={1}
            placeholder={t("global.description")}
            onChange={(value) => {
              setDescription(value);
            }}
            value={description}
          />

          <Switch
            appearance="on-off"
            optionLeft={t("screens.addVocab.activeLabel")}
            onChange={() => setActive((a) => !a)}
            checked={active}
          />
        </div>

        <div className="form-submit">
          <Button
            block
            tabIndex={-1}
            onClick={onSubmit}
            disabled={
              !(
                foreignWord &&
                translations?.length &&
                selectedGroup &&
                selectedPackage
              )
            }
          >
            {t("global.add")}
          </Button>
        </div>
      </div>
      <Modal
        title={"Add Package"}
        open={showAddPackage}
        onClose={closePackageModal}
      >
        <PackageForm onSubmitCallback={packageAdded} />
      </Modal>
      <Modal title={"Add Group"} open={showAddGroup} onClose={closeGroupModal}>
        <GroupForm
          fixedPackage
          selectedPackage={selectedPackage}
          onSubmitCallback={groupAdded}
        />
      </Modal>
    </>
  );
};

export default AddVocab;