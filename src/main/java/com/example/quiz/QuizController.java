package com.example.quiz;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
public class QuizController {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping("/questions")
    public List<Question> getQuestions() throws IOException {
        File file = new File("questions.json");
        return objectMapper.readValue(file, new TypeReference<List<Question>>() {});
    }
}
