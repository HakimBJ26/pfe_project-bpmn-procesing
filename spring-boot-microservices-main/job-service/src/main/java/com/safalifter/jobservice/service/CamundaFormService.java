package com.safalifter.jobservice.service;

import com.safalifter.jobservice.dto.DynamicFormDto;
import lombok.RequiredArgsConstructor;
import org.camunda.bpm.engine.TaskService;
import org.camunda.bpm.engine.task.Task;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CamundaFormService {
    private final TaskService taskService;
    private final DynamicFormService formService;

    public DynamicFormDto getFormForTask(String taskId) {
        Task task = taskService.createTaskQuery()
                .taskId(taskId)
                .singleResult();
        
        if (task == null) {
            throw new RuntimeException("Task not found: " + taskId);
        }

        String processDefinitionKey = task.getProcessDefinitionId().split(":")[0];
        String taskDefinitionKey = task.getTaskDefinitionKey();

        return formService.getFormByProcessAndTask(processDefinitionKey, taskDefinitionKey);
    }

    public void submitFormData(String taskId, String formData) {
        Task task = taskService.createTaskQuery()
                .taskId(taskId)
                .singleResult();
        
        if (task == null) {
            throw new RuntimeException("Task not found: " + taskId);
        }

        // Sauvegarder les données du formulaire comme variable de processus
        taskService.setVariable(taskId, "formData", formData);
        
        // Compléter la tâche
        taskService.complete(taskId);
    }
}
