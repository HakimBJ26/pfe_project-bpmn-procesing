package com.safalifter.jobservice.controller;

import com.safalifter.jobservice.dto.*;
import com.safalifter.jobservice.service.ProcessService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/process")
@RequiredArgsConstructor
public class ProcessController {
    private final ProcessService processService;

    @PostMapping("/deploy")
    public ResponseEntity<DeploymentDto> deployProcess(@RequestBody String bpmnXml) {
        return ResponseEntity.ok(processService.deployProcess(bpmnXml));
    }

    @PostMapping("/start/{processKey}")
    public ResponseEntity<ProcessInstanceDto> startProcess(@PathVariable String processKey) {
        return ResponseEntity.ok(processService.startProcess(processKey));
    }

    @GetMapping("/tasks")
    public ResponseEntity<List<TaskDto>> getActiveTasks() {
        return ResponseEntity.ok(processService.getTasks());
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<TaskDto> getTaskById(@PathVariable String taskId) {
        return ResponseEntity.ok(processService.getTaskById(taskId));
    }

    @GetMapping("/instances")
    public ResponseEntity<List<ProcessInstanceDto>> getInstances() {
        return ResponseEntity.ok(processService.getInstances());
    }

    @GetMapping("/definitions")
    public ResponseEntity<List<ProcessDefinitionDto>> getProcessDefinitions() {
        return ResponseEntity.ok(processService.getProcessDefinitions());
    }

    @PostMapping("/complete-task/{taskId}")
    public ResponseEntity<Void> completeTask(
            @PathVariable String taskId,
            @RequestBody(required = false) Map<String, Object> variables) {
        processService.completeTask(taskId, variables);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/instance/{instanceId}")
    public ResponseEntity<Void> deleteInstance(@PathVariable String instanceId) {
        processService.deleteProcessInstance(instanceId);
        return ResponseEntity.noContent().build();
    }
}