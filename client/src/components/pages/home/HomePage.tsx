import {useNavigate} from "react-router";
import {appRoutes} from "../../../globals.ts";

function HomePage() {
    const navigate = useNavigate();

    return (
        <div className="flex-column-center flex-column-fit-content">
            <h1>Survey App Demo</h1>
            <div className="flex-column-center flex-column-fit-content flex-column-children-fit-width">
                <button className="button button-primary button-large"
                        onClick={() => navigate(appRoutes.editSurveyRoute.getFullPath())}>
                    Edit survey
                </button>
                <button className="button button-danger button-large"
                        onClick={() => navigate(appRoutes.startSurveyRoute.getFullPath())}>
                    Start survey
                </button>
                <button className="button button-danger button-large"
                        onClick={() => navigate(appRoutes.viewSurveysResultsRoute.getFullPath())}>
                    View results
                </button>
            </div>
        </div>
    );
}

export default HomePage;
