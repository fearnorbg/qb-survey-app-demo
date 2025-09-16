import {useLoaderData, useNavigate} from "react-router";
import {
    type FormEvent,
    type ChangeEvent,
    useCallback,
    useReducer,
    useState,
    useRef,
} from "react";
import {
    type AddEditSurveyQuestionPageLoaderData, createEditQuestionViewModel, createSurveyQuestionEntity,
} from "./addEditSurveyQuestionPageViewModel.ts";
import {questionViewModelReducer} from "./addEditSurveyQuestionPageReducer.ts";
import {SurveyQuestionChoicesSort} from "../../../../../shared/model.ts";
import {
    appRoutes,
    boolToString,
    choiceSortValueToLabel, serverOrigin,
    stringToBool,
    stringToSurveyQuestionChoicesSortValue
} from "../../../globals.ts";

const questionLabelPattern = /.*\S.*/;
const choiceMaxLength = 40;
const minChoices = 2;
const maxChoices = 50;

// TODO: Use navigation blocking to prevent the user from losing unsaved changes: https://reactrouter.com/how-to/navigation-blocking.
// TODO: Use a form library.
// TODO: Allow added choices to be edited.
// TODO: Allow choices to be reordered using drag-and-drop.
// TODO: Use uncontrolled components for better performance: https://legacy.reactjs.org/docs/uncontrolled-components.html.
function AddEditSurveyQuestionPage() {
    const navigate = useNavigate();
    const loaderData = useLoaderData<AddEditSurveyQuestionPageLoaderData>();
    const [lastLoaderData, setLastLoaderData] = useState<AddEditSurveyQuestionPageLoaderData>(loaderData);
    const [viewModel, updateViewModel] = useReducer(questionViewModelReducer, loaderData, createEditQuestionViewModel);
    const [formKey, setFormKey] = useState(0);
    const pendingChoiceInput = useRef<HTMLInputElement>(null);
    const resetForm = useCallback(() => {
        // On reset:
        // * If we're in the edit case => the form values are reset to the ones from the unedited item
        // * If we're in the add case => the form values are reset to the empty ones
        updateViewModel({type: 'reset', value: loaderData});
        setFormKey((value) => value + 1);
    }, [loaderData]);

    // !!!IMPORTANT!!!
    // This code handles the case where the loader data changes dynamically.
    /// !!! IMPORTANT !!!
    //
    // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
    // Reset the model and recreate the form DOM if the loader data changes.
    // Avoid using HTMLFormElement.reset() to due to some issues.
    if (lastLoaderData !== loaderData) {
        setLastLoaderData(loaderData);
        resetForm();
    }

    const onSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
        event.stopPropagation();
        event.preventDefault();

        // TODO: Display a nice dismissable error banner below the component header.
        if (viewModel.choices.length < minChoices) {
            alert("Error: at least 2 choices are required!");
            return;
        }

        // TODO: Display a nice confirmation modal.
        if (pendingChoiceInput.current && pendingChoiceInput.current.value.trim() !== '') {
            const discardPendingChoice = confirm("Continue without adding pending choice?");
            if (!discardPendingChoice) {
                return;
            }
        }

        console.log('Raw FormData', [...new FormData(event.currentTarget).entries()]);
        console.log('ViewModel', viewModel);

        // TODO: This is definitely not how it should be done in React! The component could be destroyed while the response has not been returned. Also show spinner/loader.
        let response: Response;
        if (loaderData.actionType === 'edit') {
            response = await fetch(`${serverOrigin}/questions/${viewModel.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(createSurveyQuestionEntity(viewModel))
            });
        } else if (loaderData.actionType === 'add') {
            response = await fetch(`${serverOrigin}/questions`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(createSurveyQuestionEntity(viewModel))
            });
        } else {
            throw new Error('Not implemented!');
        }

        // TODO: Display a nice dismissable error banner below the component header.
        if (!response.ok) {
            console.error("Failed to save question!", response);
            alert("Failed to save question, please see the browser's console for more information.");
        } else {
            navigate(appRoutes.editSurveyRoute.getFullPath());
        }

    }, [viewModel, loaderData, navigate]);

    const onReset = useCallback(() => {
        // TODO: Display a nice confirmation modal.
        // TODO: Display the confirmation only if there are changes.
        const resetValues = confirm("Reset values?");
        if (resetValues) {
            resetForm();
        }
    }, [resetForm]);

    const onCancel = useCallback(() => {
        // TODO: Display a nice confirmation modal.
        // TODO: Display the confirmation only if there are changes.
        const discardChanges = confirm("Discard changes?");
        if (discardChanges) {
            navigate(appRoutes.editSurveyRoute.getFullPath());
        }
    }, [navigate])

    const onLabelChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        updateViewModel({type: "updateLabel", value: event.target.value})
    }, []);

    const onIsMultiChoiceSelectChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        updateViewModel({type: "updateIsMultiChoice", value: stringToBool(event.target.value)})
    }, []);

    const onIsRequiredInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        updateViewModel({type: "updateIsRequired", value: event.target.checked})
    }, []);

    const onChoicesDisplayOrderChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        const rawValue = event.target.value;
        const value = stringToSurveyQuestionChoicesSortValue(rawValue);
        if (value === null) {
            throw new Error(`Value: ${rawValue} is not in SurveyQuestionChoicesSort.`);
        }

        updateViewModel({type: "updateChoicesDisplayOrder", value: value})
    }, []);

    const addPendingChoice = useCallback(() => {
        if (!pendingChoiceInput.current) {
            return;
        }

        const pendingChoiceValue = pendingChoiceInput.current.value.trim();
        const validationError: string = (() => {
            if (pendingChoiceValue === '') {
                return 'A choice must contain at least 1 non-whitespace character.'
            } else if (pendingChoiceValue.length > choiceMaxLength) {
                return `Choice length must be less than ${choiceMaxLength} character.`
            } else if (viewModel.choices.map((choice) => choice.label).includes(pendingChoiceValue)) {
                return 'Choice already exists.';
            } else if (viewModel.choices.length >= maxChoices) {
                return `There cannot be more than ${maxChoices} choices.`;
            } else {
                return '';
            }
        })();

        pendingChoiceInput.current.setCustomValidity(validationError);
        pendingChoiceInput.current.reportValidity();
        if (!validationError) {
            pendingChoiceInput.current.value = '';
            updateViewModel({type: 'addChoice', label: pendingChoiceValue.trim()})
        }
    }, [viewModel]);

    const clearPendingChoice = useCallback(() => {
        if (!pendingChoiceInput.current) {
            return;
        }

        pendingChoiceInput.current.value = '';
        pendingChoiceInput.current.setCustomValidity('')
    }, []);

    const resetPendingInputChoiceValidation = useCallback(() => {
        if (!pendingChoiceInput.current) {
            return;
        }

        pendingChoiceInput.current.setCustomValidity('');
    }, []);

    const removeChoice = useCallback((choiceLabel: string) => {
        updateViewModel({type: 'removeChoice', label: choiceLabel})
    }, []);

    const updateChoiceIsDefault = useCallback((choiceLabel: string, isDefault: boolean) => {
        updateViewModel({type: 'updateChoiceIsDefault', label: choiceLabel, isDefault: isDefault});
    }, []);

    return (
        <div className="flex-column-center flex-column-children-fit-width flex-no-gap"
             style={{width: "640px", border: "2px solid black"}}>
            <div className="bold"
                 style={{borderBottom: "2px solid black", padding: "4px", backgroundColor: "lightblue"}}>
                {loaderData.actionType === "add" ? "Add Question" : "Edit Question"}
            </div>
            <form key={formKey} onSubmit={onSubmit}
                  className="flex-column-center flex-column-children-fit-width" style={{padding: "1rem"}}>
                <div className="flex-row">
                    <span className="width-160">Label</span>
                    <div className="flex-1-1-100">
                        <input name="label" required={true} pattern={questionLabelPattern.source}
                               value={viewModel.label} onChange={onLabelChange}
                               title="Label must contain at least 1 non-whitespace character."/>
                    </div>
                </div>
                <div className="flex-row">
                    <span className="width-160">Type</span>
                    <div className="flex-1-1-100">
                        <select name="isMultiChoice" required={true}
                                value={boolToString(viewModel.isMultiChoice)} onChange={onIsMultiChoiceSelectChange}>
                            <option value={boolToString(false)}>Single-select</option>
                            <option value={boolToString(true)}>Multi-select</option>
                        </select>
                    </div>
                </div>
                <div className="flex-row">
                    <span className="width-160">Require answer</span>
                    <div className="flex-1-1-100">
                        <input type="checkbox" name="isRequired" checked={viewModel.isRequired}
                               value={boolToString(true)} onChange={onIsRequiredInputChange}/>
                    </div>
                </div>
                <div className="flex-row">
                    <span className="width-160">Choices display order</span>
                    <div className="flex-1-1-100">
                        <select name="choicesDisplayOrder" required={true}
                                value={viewModel.choicesDisplayOrder} onChange={onChoicesDisplayOrderChange}>
                            {
                                Object.values(SurveyQuestionChoicesSort).map((sortValue) => {
                                    return (<option value={sortValue}
                                                    key={sortValue}>{choiceSortValueToLabel[sortValue]}</option>);
                                })
                            }
                        </select>
                    </div>
                </div>
                <div className="flex-row">
                    <span className="width-160">Add choice</span>
                    <div className="flex-1-1-100 flex-row">
                        <input name="pendingChoice" ref={pendingChoiceInput}
                               onInput={resetPendingInputChoiceValidation}
                               onBlur={resetPendingInputChoiceValidation}/>
                        <button type="button" onClick={addPendingChoice}
                                className="button button-primary">Add
                        </button>
                        <button type="button" onClick={clearPendingChoice}
                                className="button button-danger">Clear
                        </button>
                    </div>
                </div>
                <div className="flex-row">
                    <span className="width-160">Choices</span>
                    <div className="flex-1-1-100 flex-column flex-column-fit-content"
                         style={{border: "1px solid black", padding: "0.5rem"}}>
                        {
                            viewModel.choices.length === 0 ? (
                                <span className="italic">No choices added</span>
                            ) : (
                                viewModel.choices.map((choice) => {
                                    return (
                                        <div key={choice.label} className="flex-row">
                                            <input type={viewModel.isMultiChoice ? 'checkbox' : 'radio'}
                                                   name="defaultChoices" value={choice.label}
                                                   checked={viewModel.defaultChoices.has(choice.label)}
                                                   onChange={(event) => updateChoiceIsDefault(choice.label, event.target.checked)}/>
                                            <input type="hidden" name="choices" value={choice.label}/>
                                            <span>{choice.label}</span>
                                            <button onClick=
                                                        {() => removeChoice(choice.label)}
                                                    className="button button-danger">
                                                X
                                            </button>
                                        </div>
                                    );
                                })
                            )
                        }
                    </div>
                </div>
                <div className="flex-row justify-content-flex-end">
                    <input type="button" value="Reset" onClick={onReset} className="button button-secondary"/>
                    <input type="button" value="Cancel" onClick={onCancel} className="button button-danger"/>
                    <input type="submit" value="Save" className="button button-primary"/>
                </div>
            </form>
        </div>
    );
}

export default AddEditSurveyQuestionPage;
