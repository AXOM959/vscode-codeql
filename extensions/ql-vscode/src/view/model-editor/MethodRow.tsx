import {
  VSCodeButton,
  VSCodeLink,
  VSCodeProgressRing,
} from "@vscode/webview-ui-toolkit/react";
import * as React from "react";
import {
  Fragment,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { styled } from "styled-components";
import { vscode } from "../vscode-api";

import { Method } from "../../model-editor/method";
import { ModeledMethod } from "../../model-editor/modeled-method";
import { ModelKindDropdown } from "./ModelKindDropdown";
import { Mode } from "../../model-editor/shared/mode";
import { MethodClassifications } from "./MethodClassifications";
import { getModelingStatus } from "../../model-editor/shared/modeling-status";
import { ModelingStatusIndicator } from "./ModelingStatusIndicator";
import { InProgressDropdown } from "./InProgressDropdown";
import { MethodName } from "./MethodName";
import { ModelTypeDropdown } from "./ModelTypeDropdown";
import { ModelInputDropdown } from "./ModelInputDropdown";
import { ModelOutputDropdown } from "./ModelOutputDropdown";
import { ModelEditorViewState } from "../../model-editor/shared/view-state";
import { Codicon } from "../common";
import { canAddNewModeledMethod } from "../../model-editor/shared/multiple-modeled-methods";
import { DataGridCell, DataGridRow } from "../common/DataGrid";

const ApiOrMethodRow = styled.div`
  min-height: calc(var(--input-height) * 1px);
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5em;
`;

const UsagesButton = styled.button`
  color: var(--vscode-editor-foreground);
  background-color: var(--vscode-input-background);
  border: none;
  border-radius: 40%;
  cursor: pointer;
`;

const ViewLink = styled(VSCodeLink)`
  white-space: nowrap;
`;

const ProgressRing = styled(VSCodeProgressRing)`
  width: 16px;
  height: 16px;
  margin-left: auto;
`;

const CodiconRow = styled(VSCodeButton)`
  min-height: calc(var(--input-height) * 1px);
  align-items: center;
`;

export type MethodRowProps = {
  method: Method;
  methodCanBeModeled: boolean;
  modeledMethods: ModeledMethod[];
  methodIsUnsaved: boolean;
  modelingInProgress: boolean;
  viewState: ModelEditorViewState;
  revealedMethodSignature: string | null;
  onChange: (methodSignature: string, modeledMethods: ModeledMethod[]) => void;
};

export const MethodRow = (props: MethodRowProps) => {
  const { method, methodCanBeModeled, revealedMethodSignature } = props;

  const ref = useRef<HTMLElement>();

  useEffect(() => {
    if (method.signature === revealedMethodSignature) {
      ref.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [method, revealedMethodSignature]);

  if (methodCanBeModeled) {
    return <ModelableMethodRow {...props} ref={ref} />;
  } else {
    return <UnmodelableMethodRow {...props} ref={ref} />;
  }
};

const ModelableMethodRow = forwardRef<HTMLElement | undefined, MethodRowProps>(
  (props, ref) => {
    const {
      method,
      modeledMethods: modeledMethodsProp,
      methodIsUnsaved,
      viewState,
      revealedMethodSignature,
      onChange,
    } = props;

    const modeledMethods = useMemo(
      () => modeledMethodsToDisplay(modeledMethodsProp, method, viewState),
      [modeledMethodsProp, method, viewState],
    );

    const modeledMethodChangedHandlers = useMemo(
      () =>
        modeledMethods.map((_, index) => (modeledMethod: ModeledMethod) => {
          const newModeledMethods = [...modeledMethods];
          newModeledMethods[index] = modeledMethod;
          onChange(method.signature, newModeledMethods);
        }),
      [method, modeledMethods, onChange],
    );

    const removeModelClickedHandlers = useMemo(
      () =>
        modeledMethods.map((_, index) => () => {
          const newModeledMethods = [...modeledMethods];
          newModeledMethods.splice(index, 1);
          onChange(method.signature, newModeledMethods);
        }),
      [method, modeledMethods, onChange],
    );

    const handleAddModelClick = useCallback(() => {
      const newModeledMethod: ModeledMethod = {
        type: "none",
        input: "",
        output: "",
        kind: "",
        provenance: "manual",
        signature: method.signature,
        packageName: method.packageName,
        typeName: method.typeName,
        methodName: method.methodName,
        methodParameters: method.methodParameters,
      };
      const newModeledMethods = [...modeledMethods, newModeledMethod];
      onChange(method.signature, newModeledMethods);
    }, [method, modeledMethods, onChange]);

    const jumpToMethod = useCallback(
      () => sendJumpToMethodMessage(method),
      [method],
    );

    const modelingStatus = getModelingStatus(modeledMethods, methodIsUnsaved);

    const addModelButtonDisabled = !canAddNewModeledMethod(modeledMethods);

    return (
      <DataGridRow
        data-testid="modelable-method-row"
        ref={ref}
        focused={revealedMethodSignature === method.signature}
      >
        <DataGridCell gridRow={`span ${modeledMethods.length}`}>
          <ApiOrMethodRow>
            <ModelingStatusIndicator status={modelingStatus} />
            <MethodClassifications method={method} />
            <MethodName {...props.method} />
            {viewState.mode === Mode.Application && (
              <UsagesButton onClick={jumpToMethod}>
                {method.usages.length}
              </UsagesButton>
            )}
            <ViewLink onClick={jumpToMethod}>View</ViewLink>
            {props.modelingInProgress && <ProgressRing />}
          </ApiOrMethodRow>
        </DataGridCell>
        {props.modelingInProgress && (
          <>
            <DataGridCell>
              <InProgressDropdown />
            </DataGridCell>
            <DataGridCell>
              <InProgressDropdown />
            </DataGridCell>
            <DataGridCell>
              <InProgressDropdown />
            </DataGridCell>
            <DataGridCell>
              <InProgressDropdown />
            </DataGridCell>
            {viewState.showMultipleModels && (
              <DataGridCell>
                <CodiconRow appearance="icon" disabled={true}>
                  <Codicon name="add" label="Add new model" />
                </CodiconRow>
              </DataGridCell>
            )}
          </>
        )}
        {!props.modelingInProgress && (
          <>
            {modeledMethods.map((modeledMethod, index) => (
              <Fragment key={index}>
                <DataGridCell>
                  <ModelTypeDropdown
                    method={method}
                    modeledMethod={modeledMethod}
                    onChange={modeledMethodChangedHandlers[index]}
                  />
                </DataGridCell>
                <DataGridCell>
                  <ModelInputDropdown
                    method={method}
                    modeledMethod={modeledMethod}
                    onChange={modeledMethodChangedHandlers[index]}
                  />
                </DataGridCell>
                <DataGridCell>
                  <ModelOutputDropdown
                    method={method}
                    modeledMethod={modeledMethod}
                    onChange={modeledMethodChangedHandlers[index]}
                  />
                </DataGridCell>
                <DataGridCell>
                  <ModelKindDropdown
                    method={method}
                    modeledMethod={modeledMethod}
                    onChange={modeledMethodChangedHandlers[index]}
                  />
                </DataGridCell>
                {viewState.showMultipleModels && (
                  <DataGridCell>
                    {index === modeledMethods.length - 1 ? (
                      <CodiconRow
                        appearance="icon"
                        aria-label="Add new model"
                        onClick={handleAddModelClick}
                        disabled={addModelButtonDisabled}
                      >
                        <Codicon name="add" />
                      </CodiconRow>
                    ) : (
                      <CodiconRow
                        appearance="icon"
                        aria-label="Remove model"
                        onClick={removeModelClickedHandlers[index]}
                      >
                        <Codicon name="trash" />
                      </CodiconRow>
                    )}
                  </DataGridCell>
                )}
              </Fragment>
            ))}
          </>
        )}
      </DataGridRow>
    );
  },
);
ModelableMethodRow.displayName = "ModelableMethodRow";

const UnmodelableMethodRow = forwardRef<
  HTMLElement | undefined,
  MethodRowProps
>((props, ref) => {
  const { method, viewState, revealedMethodSignature } = props;

  const jumpToMethod = useCallback(
    () => sendJumpToMethodMessage(method),
    [method],
  );

  return (
    <DataGridRow
      data-testid="unmodelable-method-row"
      ref={ref}
      focused={revealedMethodSignature === method.signature}
    >
      <DataGridCell>
        <ApiOrMethodRow>
          <ModelingStatusIndicator status="saved" />
          <MethodName {...props.method} />
          {viewState.mode === Mode.Application && (
            <UsagesButton onClick={jumpToMethod}>
              {method.usages.length}
            </UsagesButton>
          )}
          <ViewLink onClick={jumpToMethod}>View</ViewLink>
          <MethodClassifications method={method} />
        </ApiOrMethodRow>
      </DataGridCell>
      <DataGridCell gridColumn="span 4">Method already modeled</DataGridCell>
    </DataGridRow>
  );
});
UnmodelableMethodRow.displayName = "UnmodelableMethodRow";

function sendJumpToMethodMessage(method: Method) {
  vscode.postMessage({
    t: "jumpToMethod",
    methodSignature: method.signature,
  });
}

function modeledMethodsToDisplay(
  modeledMethods: ModeledMethod[],
  method: Method,
  viewState: ModelEditorViewState,
): ModeledMethod[] {
  if (modeledMethods.length === 0) {
    return [
      {
        type: "none",
        input: "",
        output: "",
        kind: "",
        provenance: "manual",
        signature: method.signature,
        packageName: method.packageName,
        typeName: method.typeName,
        methodName: method.methodName,
        methodParameters: method.methodParameters,
      },
    ];
  }

  if (viewState.showMultipleModels) {
    return modeledMethods;
  } else {
    return modeledMethods.slice(0, 1);
  }
}
