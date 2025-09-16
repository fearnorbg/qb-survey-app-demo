import {useCallback} from "react";
import {useLoaderData, useNavigate} from "react-router";
import {appRoutes, choiceSortValueToLabel} from "../../../globals.ts";
import type {SurveyQuestionEntity} from "../../../../../shared/model.ts";

function EditSurveyQuestionEntityRenderer({entity, index}: { entity: SurveyQuestionEntity, index: number }) {
    const navigate = useNavigate();
    const deleteQuestion = useCallback(() => {
        alert('Not implemented!');
    }, []);
    const editQuestion = useCallback(() => {
        navigate(appRoutes.editQuestionRoute.getFullPath(entity.id));
    }, [navigate, entity]);

    return (
        <div className="flex-column flex-column-children-fit-width"
             style={{border: "1px solid black", padding: "1rem"}}>
            <h2 style={{textAlign: "center", margin: 0}}>Question {index + 1}</h2>
            <div className="flex-row">
                <span className="bold width-160">Label</span>
                <span>{entity.label}</span>
            </div>
            <div className="flex-row">
                <span className="bold width-160">Type</span>
                <span>{entity.isMultiChoice ? 'Multi-select' : 'Single-select'}</span>
            </div>
            <div className="flex-row">
                <span className="bold width-160">Require answer</span>
                <span>{entity.isRequired ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex-row">
                <span className="bold width-160">Choices display order</span>
                <span>{choiceSortValueToLabel[entity.choicesDisplayOrder]}</span>
            </div>
            <div className="flex-row">
                <span className="bold width-160">Choices</span>
                <div className="flex-1-1-100">{

                    entity.choices.map((choice) => {
                        return (
                            <div key={choice.label} className="flex-row">
                                <input type={entity.isMultiChoice ? 'checkbox' : 'radio'}
                                       name="defaultChoices"
                                       value={choice.label}
                                       checked={entity.defaultChoices.includes(choice.label)}
                                       disabled
                                       style={{marginLeft: 0}}></input>
                                <span>{choice.label}</span>
                            </div>
                        )
                    })
                }</div>
            </div>
            <div className="flex-row justify-content-flex-end">
                <button className="button button-danger"
                        onClick={deleteQuestion}>Delete
                </button>
                <button className="button button-primary"
                        onClick={editQuestion}>Edit
                </button>
            </div>
        </div>
    );
}

function EditSurveyPage() {
    const loaderData = useLoaderData<Array<SurveyQuestionEntity>>();
    const navigate = useNavigate();

    const addQuestion = useCallback(() => {
        navigate(appRoutes.addQuestionRoute.getFullPath())
    }, [navigate]);

    return (
        <div className="flex-column-center flex-column-fit-content">
            <h1>Edit Survey</h1>
            <div className="flex-column-center flex-column-fit-content flex-column-children-fit-width">
                <button className="button button-primary button-large"
                        onClick={addQuestion}>
                    Add Question
                </button>
            </div>
            <h2>Questions</h2>
            <div className="flex-column-center flex-column-children-fit-width" style={{width: "640px"}}>
                {
                    loaderData.length === 0 ?
                        (<div className="italic" style={{textAlign: "center"}}>No questions added yet!</div>) :
                        (<></>)
                }
                {
                    loaderData.map((questionEntity: SurveyQuestionEntity, index: number) => {
                        return (
                            <EditSurveyQuestionEntityRenderer key={questionEntity.id} entity={questionEntity}
                                                              index={index}></EditSurveyQuestionEntityRenderer>
                        )
                    })
                }
            </div>
        </div>
    );
}

export default EditSurveyPage;
