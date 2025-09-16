// TODO: Should be an enum, but enums do not work with ts-node for some reason
export const SurveyQuestionChoicesSort = {
    'AsIs': 'asIs',
    'Alphabetical': 'alphabetical',
    'ReverseAlphabetical': 'reverseAlphabetical'
} as const;
export type SurveyQuestionChoicesSort = typeof SurveyQuestionChoicesSort[keyof typeof SurveyQuestionChoicesSort]

export type SurveyQuestionChoiceEntity = {
    label: string;
}

export type SurveyQuestionEntity = {
    id: string;
    label: string;
    isMultiChoice: boolean;
    isRequired: boolean;
    choicesDisplayOrder: SurveyQuestionChoicesSort;
    choices: SurveyQuestionChoiceEntity[];
    defaultChoices: string[];
}