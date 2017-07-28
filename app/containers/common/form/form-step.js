import { connect } from 'react-redux';
import {
  getBtnTextByType,
  parseQuestion,
  getTemplate,
  getAnswers,
  getNextStep,
  isQuestionAnswered
} from 'helpers/forms';
import FormStep from 'components/common/form/form-step';

function getNextCallback({ currentQuestion, questions, answers, navigator, form, screen, title, finish }) {
  const nextStep = getNextStep({ currentQuestion, questions, answers });
  if (nextStep && currentQuestion < questions.length - 1) {
    return () => navigator.push({
      title,
      screen,
      passProps: {
        form,
        title,
        screen,
        step: nextStep,
        disableDraft: false
      }
    });
  }
  return () => {
    navigator.push({
      title: 'Review report',
      screen: 'ForestWatcher.Answers',
      backButtonHidden: true,
      passProps: {
        form,
        finish,
        disableDraft: false
      }
    });
  };
}

function getEditNextCallback({ currentQuestion, questions, answers, navigator, form, screen, title }) {
  const nextStep = getNextStep({ currentQuestion, questions, answers });
  if (nextStep && currentQuestion < questions.length - 1) {
    const nextQuestionName = questions[nextStep].name;
    if (typeof answers[nextQuestionName] === 'undefined') {
      return () => navigator.push({
        title,
        screen,
        passProps: {
          editMode: true,
          form,
          title,
          screen,
          step: nextStep,
          disableDraft: false
        }
      });
    }
  }
  return () => {
    navigator.dismissModal();
  };
}

function mapStateToProps(state, { form, index, questionsToSkip, finish, title, screen, navigator, editMode }) {
  const template = getTemplate(state, form);
  const questions = template.questions;
  const question = questions && questions[index];
  const parsedQuestion = question && parseQuestion({ question, form: template }, state.app.language);
  const answers = getAnswers(state.form, form);
  const hasAnswer = isQuestionAnswered(question, answers);
  const nextText = !hasAnswer && question.required ? getBtnTextByType(question.type) : 'commonText.next';
  const getCallback = editMode ? getEditNextCallback : getNextCallback;
  return {
    form,
    questionsToSkip,
    question: parsedQuestion,
    hasAnswer,
    navigator,
    next: {
      text: nextText,
      callback: getCallback({
        finish,
        navigator,
        form,
        screen,
        title,
        currentQuestion: index,
        questions,
        answers,
        isConnected: state.offline.online
      })
    }
  };
}


export default connect(mapStateToProps)(FormStep);
