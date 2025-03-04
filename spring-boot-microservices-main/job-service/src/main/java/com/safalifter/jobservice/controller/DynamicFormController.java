package com.safalifter.jobservice.controller;

import com.safalifter.jobservice.dto.DynamicFormDto;
import com.safalifter.jobservice.service.DynamicFormService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/forms")
@RequiredArgsConstructor
public class DynamicFormController {
    private final DynamicFormService formService;

    @PostMapping
    public ResponseEntity<DynamicFormDto> createForm(@RequestBody DynamicFormDto formDto) {
        return ResponseEntity.ok(formService.createForm(formDto));
    }

    @GetMapping
    public ResponseEntity<List<DynamicFormDto>> getAllForms() {
        return ResponseEntity.ok(formService.getAllForms());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DynamicFormDto> getFormById(@PathVariable String id) {
        return ResponseEntity.ok(formService.getFormById(id));
    }

    @GetMapping("/process/{processKey}")
    public ResponseEntity<List<DynamicFormDto>> getFormsByProcess(@PathVariable String processKey) {
        return ResponseEntity.ok(formService.getFormsByProcessDefinition(processKey));
    }

    @GetMapping("/process/{processKey}/task/{taskKey}")
    public ResponseEntity<DynamicFormDto> getFormByProcessAndTask(
            @PathVariable String processKey,
            @PathVariable String taskKey) {
        return ResponseEntity.ok(formService.getFormByProcessAndTask(processKey, taskKey));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DynamicFormDto> updateForm(
            @PathVariable String id,
            @RequestBody DynamicFormDto formDto) {
        return ResponseEntity.ok(formService.updateForm(id, formDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteForm(@PathVariable String id) {
        formService.deleteForm(id);
        return ResponseEntity.noContent().build();
    }
}
