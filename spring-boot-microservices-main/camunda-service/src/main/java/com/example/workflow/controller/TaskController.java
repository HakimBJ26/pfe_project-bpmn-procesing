package com.example.workflow.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.camunda.bpm.engine.FormService;
import org.camunda.bpm.engine.TaskService;
import org.camunda.bpm.engine.task.Task;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.workflow.dto.TaskDTO;
import com.example.workflow.model.Form;
import com.example.workflow.service.FormsService;


@RestController
public class TaskController {

    @Autowired
    private TaskService taskService;

    @Autowired
    private FormService formService;

    @Autowired
    private FormsService formsService;


    @GetMapping("/tasks")
    public ResponseEntity<List<TaskDTO>> getCurrentRunningTasks(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String candidateGroup) {
        List<Task> tasks;
        if (userId != null && !userId.isEmpty()) {
            tasks = taskService.createTaskQuery().taskAssignee(userId).active().list();
        } else if (candidateGroup != null && !candidateGroup.isEmpty()) {
            tasks = taskService.createTaskQuery().taskCandidateGroup(candidateGroup).active().list();
        } else {
            tasks = taskService.createTaskQuery().active().list();
        }
        List<TaskDTO> taskDTOs = tasks.stream()
                .map(task -> new TaskDTO(task.getId(), task.getName(), task.getAssignee()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(taskDTOs);
    }

    @GetMapping("/tasks/{taskId}")
    public ResponseEntity<TaskDTO> getTask(@PathVariable String taskId) {
        Task task = taskService.createTaskQuery().taskId(taskId).singleResult();
        if (task == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(new TaskDTO(task.getId(), task.getName(), task.getAssignee()));
    }

    @PostMapping("/tasks/{taskId}/user/claim")
    public ResponseEntity<String> userClaimTask(@PathVariable String taskId, @RequestParam String userId) {
        try {
            taskService.claim(taskId, userId);
            return ResponseEntity.ok("Task claimed successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to claim task: " + e.getMessage());
        }
    }

    @PostMapping("/tasks/{taskId}/group/assign")
    public ResponseEntity<String> assignTaskToGroup(@PathVariable String taskId, @RequestParam String groupId) {
        try {
            taskService.addCandidateGroup(taskId, groupId);
            return ResponseEntity.ok("Task assigned to group " + groupId + " successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to claim task: " + e.getMessage());
        }
    }

    @GetMapping("/task/{taskId}/form")
    public ResponseEntity<Map<String, Object>> getTaskForm(@PathVariable String taskId) {
        try {
            Task task = taskService.createTaskQuery().taskId(taskId).singleResult();
            if (task == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("error", "Task not found: " + taskId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            String formKey = formService.getTaskFormKey(task.getProcessDefinitionId(), task.getTaskDefinitionKey());
            if (formKey != null) {
                Form form = formsService.getFormByKey(formKey);
                if (form != null) {
                    return ResponseEntity.ok(form.getContent());
                } else {
                    return ResponseEntity.notFound().build();
                }
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("error", "Form not found for task: " + taskId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", "Failed to retrieve form: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @PostMapping("/tasks/{taskId}/submit-form")
    public ResponseEntity<String> submitTaskForm(@PathVariable String taskId,
            @RequestBody Map<String, Object> formData) {
        try {
            formService.submitTaskForm(taskId, formData);
            return ResponseEntity.ok("Form submitted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to submit form: " + e.getMessage());
        }
    }
}
