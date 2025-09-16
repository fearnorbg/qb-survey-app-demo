import express from 'express';
import cors from 'cors'
import nocache from 'nocache';
import bodyParser from "body-parser";
import {SurveyQuestionChoicesSort, type SurveyQuestionEntity} from '../../shared/model.ts';
import {appRuntimeConfig} from "../../shared/appRuntimeConfig.ts";

const app = express();
app.use(cors());
app.use(nocache());
app.use(bodyParser.json());

const host = appRuntimeConfig.serverHost;
const port = appRuntimeConfig.serverPort;
const generateQuestionId = (() =>  {
    let nextId = 0;
    return () => (nextId++).toString()
})();

const questions: SurveyQuestionEntity[] = [];
questions.push({
    id: generateQuestionId(),
    label: "What are your favorite colors?",
    isRequired: false,
    isMultiChoice: true,
    choices: ['Red', 'Blue', 'Green', 'White', 'Black', 'Yellow', 'Grey'].map((label) => ({ label: label })),
    defaultChoices: [],
    choicesDisplayOrder: SurveyQuestionChoicesSort.AsIs
});

// Get all questions
app.get('/questions', (_, res) => {
    res.send(questions);
});

// Get question
app.get('/questions/:questionId', (req, res) => {
    const questionId = req.params.questionId;
    const question = questions.find((question) => question.id === questionId);

    if (!question) {
        res.status(404).send({});
    } else {
        res.status(200).send(question);
    }
})

// TODO: Obviously missing validation
// Add question
app.post('/questions', (req, res) => {
    const questionEntity: SurveyQuestionEntity = req.body;
    questionEntity.id = generateQuestionId();
    questions.push(questionEntity);

    res.status(204).send();
});

// TODO: Obviously missing validation
// Edit question
app.put('/questions/:questionId', (req, res) => {
    const questionId = req.params.questionId;
    const existingQuestion = questions.find((question) => question.id === questionId);
    if (!existingQuestion) {
        res.status(404).send({});
    } else {
        const questionEntity: SurveyQuestionEntity = req.body;
        Object.assign(existingQuestion, questionEntity, { id: questionId });
        res.status(204).send();
    }
});

app.listen(port, host, (error) => {
    if (error) {
        console.error("Could not start survey app demon server!");
        console.error(error);
    } else {
        console.log(`Survey app demo server listening on ${host}:${port}.`)
    }
});
