import * as React from "react";
import { useMemo } from "react";
import { ExternalApiUsage } from "../../model-editor/external-api-usage";
import { ModeledMethod } from "../../model-editor/modeled-method";
import { LibraryRow } from "./LibraryRow";
import { Mode } from "../../model-editor/shared/mode";
import {
  groupMethods,
  sortGroupNames,
} from "../../model-editor/shared/sorting";
import { ModelEditorViewState } from "../../model-editor/shared/view-state";
import { InProgressMethods } from "../../model-editor/shared/in-progress-methods";

type Props = {
  externalApiUsages: ExternalApiUsage[];
  modeledMethods: Record<string, ModeledMethod>;
  modifiedSignatures: Set<string>;
  inProgressMethods: InProgressMethods;
  viewState: ModelEditorViewState;
  hideModeledApis: boolean;
  onChange: (
    modelName: string,
    externalApiUsage: ExternalApiUsage,
    modeledMethod: ModeledMethod,
  ) => void;
  onSaveModelClick: (
    externalApiUsages: ExternalApiUsage[],
    modeledMethods: Record<string, ModeledMethod>,
  ) => void;
  onGenerateFromLlmClick: (
    packageName: string,
    externalApiUsages: ExternalApiUsage[],
    modeledMethods: Record<string, ModeledMethod>,
  ) => void;
  onStopGenerateFromLlmClick: (packageName: string) => void;
  onGenerateFromSourceClick: () => void;
  onModelDependencyClick: () => void;
};

const libraryNameOverrides: Record<string, string> = {
  rt: "Java Runtime",
};

export const ModeledMethodsList = ({
  externalApiUsages,
  modeledMethods,
  modifiedSignatures,
  inProgressMethods,
  viewState,
  hideModeledApis,
  onChange,
  onSaveModelClick,
  onGenerateFromLlmClick,
  onStopGenerateFromLlmClick,
  onGenerateFromSourceClick,
  onModelDependencyClick,
}: Props) => {
  const grouped = useMemo(
    () => groupMethods(externalApiUsages, viewState.mode),
    [externalApiUsages, viewState.mode],
  );

  const libraryVersions = useMemo(() => {
    if (viewState.mode !== Mode.Application) {
      return {};
    }

    const libraryVersions: Record<string, string> = {};

    for (const externalApiUsage of externalApiUsages) {
      const { library, libraryVersion } = externalApiUsage;

      if (library && libraryVersion) {
        libraryVersions[library] = libraryVersion;
      }
    }

    return libraryVersions;
  }, [externalApiUsages, viewState.mode]);

  const sortedGroupNames = useMemo(() => sortGroupNames(grouped), [grouped]);

  return (
    <>
      {sortedGroupNames.map((libraryName) => (
        <LibraryRow
          key={libraryName}
          title={libraryNameOverrides[libraryName] ?? libraryName}
          libraryVersion={libraryVersions[libraryName]}
          externalApiUsages={grouped[libraryName]}
          modeledMethods={modeledMethods}
          modifiedSignatures={modifiedSignatures}
          inProgressMethods={inProgressMethods}
          viewState={viewState}
          hideModeledApis={hideModeledApis}
          onChange={onChange}
          onSaveModelClick={onSaveModelClick}
          onGenerateFromLlmClick={onGenerateFromLlmClick}
          onStopGenerateFromLlmClick={onStopGenerateFromLlmClick}
          onGenerateFromSourceClick={onGenerateFromSourceClick}
          onModelDependencyClick={onModelDependencyClick}
        />
      ))}
    </>
  );
};