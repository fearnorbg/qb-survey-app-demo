import {SurveyQuestionChoicesSort, type SurveyQuestionEntity} from "../../../../../shared/model.ts";

export type AddEditSurveyQuestionPageLoaderData = {
    actionType: 'add'
} | {
    actionType: 'edit',
    entity: SurveyQuestionEntity
};

export type EditQuestionChoiceViewModel = {
    label: string
}

export type EditQuestionViewModel = {
    id: string;
    label: string;
    isMultiChoice: boolean,
    isRequired: boolean,
    choicesDisplayOrder: SurveyQuestionChoicesSort;
    choices: EditQuestionChoiceViewModel[],
    defaultChoices: Set<string>;
};

export function createEditQuestionViewModel(data: AddEditSurveyQuestionPageLoaderData): EditQuestionViewModel {
    const entity = (data.actionType === 'edit') ? data.entity : null;

    if (!entity) {
        return {
            id: '',
            label: '',
            isMultiChoice: true,
            isRequired: false,
            choicesDisplayOrder: "asIs",
            choices: [],
            defaultChoices: new Set(),
        };
    }

    return {
        id: entity.id,
        label: entity.label,
        isMultiChoice: entity.isMultiChoice,
        isRequired: entity.isRequired,
        choicesDisplayOrder: entity.choicesDisplayOrder,
        choices: entity.choices.map((entityChoice) => {
            return {label: entityChoice.label};
        }),
        defaultChoices: new Set(entity.defaultChoices)
    }
}

export function createSurveyQuestionEntity(viewModel: EditQuestionViewModel): SurveyQuestionEntity {
    return {
        id: viewModel.id,
        label: viewModel.label,
        isMultiChoice: viewModel.isMultiChoice,
        isRequired: viewModel.isRequired,
        choicesDisplayOrder: viewModel.choicesDisplayOrder,
        choices: viewModel.choices,
        defaultChoices: [...viewModel.defaultChoices]
    };
}

