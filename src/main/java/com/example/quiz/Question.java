package com.example.quiz;

import java.util.List;

public class Question {
    private String type;
    private String question;
    private String answer;
    private List<String> wrongAnswers;

    public Question() {}

    public Question(String type, String question, String answer, List<String> wrongAnswers) {
        this.type = type;
        this.question = question;
        this.answer = answer;
        this.wrongAnswers = wrongAnswers;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }

    public List<String> getWrongAnswers() {
        return wrongAnswers;
    }

    public void setWrongAnswers(List<String> wrongAnswers) {
        this.wrongAnswers = wrongAnswers;
    }
}
