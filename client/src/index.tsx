import './index.scss'

import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {
    createBrowserRouter
} from "react-router";
import {RouterProvider} from "react-router/dom";
import HomePage from './components/pages/home/HomePage.tsx'
import {appRoutes, serverOrigin} from "./globals.ts";
import EditSurveyPage from "./components/pages/editSurvey/EditSurveyPage.tsx";
import AddEditSurveyQuestionPage from "./components/pages/addEditSurveyQuestion/AddEditSurveyQuestionPage.tsx";
import type {
    AddEditSurveyQuestionPageLoaderData
} from "./components/pages/addEditSurveyQuestion/addEditSurveyQuestionPageViewModel.ts";
import type {SurveyQuestionEntity} from "../../shared/model.ts";

const router = createBrowserRouter([
    {
        index: true,
        Component: HomePage,
    },
    {
        path: appRoutes.editSurveyRoute.localPath,
        children: [
            {
                index: true,
                Component: EditSurveyPage,
                loader: async (): Promise<Array<SurveyQuestionEntity>> => {
                    //TODO: handle server error
                    const response = await fetch(`${serverOrigin}/questions`);
                    const data: Array<SurveyQuestionEntity> = await response.json();
                    return data;
                },
            },
            {
                path: appRoutes.addQuestionRoute.localPath,
                Component: AddEditSurveyQuestionPage,
                loader: (): AddEditSurveyQuestionPageLoaderData => {
                    return {
                        actionType: 'add'
                    }
                }
            },
            {
                path: appRoutes.editQuestionRoute.localPath,
                Component: AddEditSurveyQuestionPage,
                loader: async (args): Promise<AddEditSurveyQuestionPageLoaderData> => {
                    //TODO: handle server error
                    const response = await fetch(`${serverOrigin}/questions/${args.params.questionId}`);
                    const data: SurveyQuestionEntity = await response.json();

                    return {
                        actionType: 'edit',
                        entity: data
                    }
                }
            },
        ]
    },
    {
        path: appRoutes.startSurveyRoute.localPath,
        element: (
            <div style={{textAlign: "center"}}>
                <h1>Start survey</h1>
                <h2 style={{color: "red"}}>Not implemented!</h2>
            </div>
        )
    },
    {
        path: appRoutes.viewSurveysResultsRoute.localPath,
        element: (
            <div style={{textAlign: "center"}}>
                <h1>View results</h1>
                <h2 style={{color: "red"}}>Not implemented!</h2>
            </div>
        )
    },
]);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <RouterProvider router={router}/>
    </StrictMode>
);