package com.safalifter.jobservice.controller;

import com.safalifter.jobservice.dto.DynamicFormDto;
import com.safalifter.jobservice.service.CamundaFormService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/tasks")
@RequiredArgsConstructor
public class CamundaFormController {
    private final CamundaFormService camundaFormService;

    @GetMapping("/{taskId}/form")
    public ResponseEntity<DynamicFormDto> getTaskForm(@PathVariable String taskId) {
        return ResponseEntity.ok(camundaFormService.getFormForTask(taskId));
    }

    @PostMapping("/{taskId}/submit")
    public ResponseEntity<Void> submitTaskForm(
            @PathVariable String taskId,
            @RequestBody String formData) {
        camundaFormService.submitFormData(taskId, formData);
        return ResponseEntity.ok().build();
    }
}
