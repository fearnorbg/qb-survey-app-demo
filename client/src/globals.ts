import {generatePath} from "react-router";
import {appRuntimeConfig} from "../../shared/appRuntimeConfig.ts";
import {SurveyQuestionChoicesSort} from "../../shared/model.ts";

const rootRoute = {
    localPath: '/',
    getFullPath: function () {
        return this.localPath;
    }
};

const homeRoute = rootRoute;

const editSurveyRoute = {
    localPath: 'edit-survey',
    getFullPath: function () {
        return rootRoute.getFullPath() + this.localPath;
    }
};

const addQuestionRoute = {
    localPath: 'add-question',
    getFullPath: function () {
        return `${editSurveyRoute.getFullPath()}/${this.localPath}`;
    }
};

const editQuestionRoute = {
    localPath: 'edit-question/:questionId',
    getFullPath: function (questionId: string ) {
        const resolvedLocalPath = generatePath(this.localPath, { questionId: questionId })
        return `${editSurveyRoute.getFullPath()}/${resolvedLocalPath}`;
    }
};

const startSurveyRoute = {
    localPath: 'start-survey',
    getFullPath: function () {
        return `${rootRoute.getFullPath()}${this.localPath}`;
    }
};

const viewSurveysResultsRoute = {
    localPath: 'surveys-results',
    getFullPath: function () {
        return `${rootRoute.getFullPath()}${this.localPath}`;
    }
};

export const appRoutes = {
    rootRoute,
    homeRoute,
    editSurveyRoute,
    addQuestionRoute,
    editQuestionRoute,
    startSurveyRoute,
    viewSurveysResultsRoute
};

export const serverOrigin = `http://${appRuntimeConfig.serverHost}:${appRuntimeConfig.serverPort}`;

export const choiceSortValueToLabel: { [Key in SurveyQuestionChoicesSort]: string } = {
    [SurveyQuestionChoicesSort.Alphabetical]: 'A -> Z',
    [SurveyQuestionChoicesSort.ReverseAlphabetical]: 'Z -> A',
    [SurveyQuestionChoicesSort.AsIs]: 'As-is',
};

export function stringToSurveyQuestionChoicesSortValue(rawValue: string): SurveyQuestionChoicesSort | null {
    return Object.values(SurveyQuestionChoicesSort)
        .find((value) => value === rawValue) || null;
}

export function boolToString(value: boolean) {
    return value.toString();
}

export function stringToBool(value: string) {
    if (value === 'true') {
        return true;
    } else if (value === 'false') {
        return false;
    }

    throw new Error(`Invalid string boolean value: ${value}`);
}