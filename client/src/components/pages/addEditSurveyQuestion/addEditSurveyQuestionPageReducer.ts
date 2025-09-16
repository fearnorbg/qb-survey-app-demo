import {
    type AddEditSurveyQuestionPageLoaderData,
    type EditQuestionViewModel,
    createEditQuestionViewModel,
} from "./addEditSurveyQuestionPageViewModel.ts";
import {
    type SurveyQuestionChoicesSort,
} from "../../../../../shared/model.ts";

type QuestionViewModelReducerAction = {
    type: 'reset',
    value: AddEditSurveyQuestionPageLoaderData
} | {
    type: 'updateLabel',
    value: string,
    error?: string
} | {
    type: 'updateIsMultiChoice',
    value: boolean
} | {
    type: 'updateIsRequired',
    value: boolean
} | {
    type: 'updateChoicesDisplayOrder'
    value: SurveyQuestionChoicesSort
} | {
    type: 'addChoice',
    label: string
} | {
    type: 'removeChoice',
    label: string
} | {
    type: 'updateChoiceIsDefault',
    label: string,
    isDefault: boolean,
}

export function questionViewModelReducer(state: EditQuestionViewModel, action: QuestionViewModelReducerAction): EditQuestionViewModel {
    if (action.type === 'reset') {
        return createEditQuestionViewModel(action.value);
    } else if (action.type === 'updateLabel') {
        return {...state, label: action.value};
    } else if (action.type === 'updateIsMultiChoice') {
        return {
            ...state,
            isMultiChoice: action.value,
            // For single-choice if there is more then one default choice, then remove all default choices
            defaultChoices:  (!action.value && state.defaultChoices.size > 1) ? new Set() : state.defaultChoices
        };
    } else if (action.type === 'updateIsRequired') {
        return {...state, isRequired: action.value};
    } else if (action.type === 'updateChoicesDisplayOrder') {
        return {...state, choicesDisplayOrder: action.value};
    } else if (action.type === 'addChoice') {
        return {
            ...state,
            choices: [
                ...state.choices,
                {
                    label: action.label,
                }
            ]
        };
    } else if (action.type === 'removeChoice') {
        const defaultChoices = new Set(state.defaultChoices);
        defaultChoices.delete(action.label)

        return {
            ...state,
            choices: state.choices.filter((choice) =>
                choice.label !== action.label),
            defaultChoices: defaultChoices
        };
    } else if (action.type === 'updateChoiceIsDefault') {
        let defaultChoices: Set<string>;
        if (state.isMultiChoice) {
            defaultChoices = new Set(state.defaultChoices);
            if (action.isDefault) {
                defaultChoices.add(action.label);
            } else {
                defaultChoices.delete(action.label);
            }
        } else {
            if (action.isDefault) {
                defaultChoices = new Set([action.label]);
            } else {
                defaultChoices = new Set(state.defaultChoices);
                defaultChoices.delete(action.label);
            }
        }

        return {
            ...state,
            defaultChoices: defaultChoices
        };
    } else {
        throw new Error(`Unknown action ${JSON.stringify(action)}.`,);
    }
}
