package com.safalifter.jobservice.service;

import com.safalifter.jobservice.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.*;
import org.camunda.bpm.engine.history.HistoricProcessInstance;
import org.camunda.bpm.engine.repository.Deployment;
import org.camunda.bpm.engine.repository.ProcessDefinition;
import org.camunda.bpm.engine.runtime.ProcessInstance;
import org.camunda.bpm.engine.task.Task;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProcessService {
    private final RuntimeService runtimeService;
    private final TaskService taskService;
    private final RepositoryService repositoryService;
    private final HistoryService historyService;

    public DeploymentDto deployProcess(String bpmnXml) {
        log.info("Deploying BPMN process");
        Deployment deployment = repositoryService.createDeployment()
                .addString("process.bpmn", bpmnXml)
                .name("BPMN Process Deployment")
                .deploy();
        log.info("Process deployed with ID: {}", deployment.getId());

        return DeploymentDto.builder()
                .deploymentId(deployment.getId())
                .processName(deployment.getName())
                .build();
    }

    public ProcessInstanceDto startProcess(String processKey) {
        log.info("Starting process with key: {}", processKey);
        ProcessInstance instance = runtimeService.startProcessInstanceByKey(processKey);
        log.info("Process instance started with ID: {}", instance.getId());
        return toInstanceDto(instance);
    }

    public List<TaskDto> getTasks() {
        log.info("Fetching all active tasks");
        List<Task> tasks = taskService.createTaskQuery()
                .active()
                .list();
        log.info("Found {} active tasks", tasks.size());
        return tasks.stream()
                .map(this::toTaskDto)
                .collect(Collectors.toList());
    }

    public List<ProcessInstanceDto> getInstances() {
        log.info("Fetching all process instances");
        List<ProcessInstance> instances = runtimeService.createProcessInstanceQuery()
                .list();
        log.info("Found {} process instances", instances.size());
        return instances.stream()
                .map(this::toInstanceDto)
                .collect(Collectors.toList());
    }

    public List<ProcessDefinitionDto> getProcessDefinitions() {
        log.info("Fetching all process definitions");
        List<ProcessDefinition> definitions = repositoryService.createProcessDefinitionQuery()
                .latestVersion()
                .list();
        log.info("Found {} process definitions", definitions.size());
        return definitions.stream()
                .map(this::toDefinitionDto)
                .collect(Collectors.toList());
    }

    public void completeTask(String taskId, Map<String, Object> variables) {
        log.info("Completing task with ID: {}", taskId);
        if (variables != null) {
            taskService.complete(taskId, variables);
        } else {
            taskService.complete(taskId);
        }
        log.info("Task completed successfully");
    }

    public void deleteProcessInstance(String instanceId) {
        log.info("Deleting process instance with ID: {}", instanceId);
        runtimeService.deleteProcessInstance(instanceId, "User request");
        log.info("Process instance deleted successfully");
    }

    public TaskDto getTaskById(String taskId) {
        log.info("Fetching task with ID: {}", taskId);
        Task task = taskService.createTaskQuery()
                .taskId(taskId)
                .singleResult();
        
        if (task == null) {
            log.error("Task not found with ID: {}", taskId);
            throw new RuntimeException("Task not found");
        }
        
        log.info("Task found: {}", task.getName());
        return toTaskDto(task);
    }

    private TaskDto toTaskDto(Task task) {
        return TaskDto.builder()
                .id(task.getId())
                .name(task.getName())
                .processInstanceId(task.getProcessInstanceId())
                .processDefinitionId(task.getProcessDefinitionId())
                .taskDefinitionKey(task.getTaskDefinitionKey())
                .created(task.getCreateTime())
                .build();
    }

    private ProcessInstanceDto toInstanceDto(ProcessInstance instance) {
        HistoricProcessInstance historicInstance = historyService.createHistoricProcessInstanceQuery()
                .processInstanceId(instance.getId())
                .singleResult();

        return ProcessInstanceDto.builder()
                .id(instance.getId())
                .processDefinitionId(instance.getProcessDefinitionId())
                .startTime(historicInstance != null ? historicInstance.getStartTime() : null)
                .ended(instance.isEnded())
                .build();
    }

    private ProcessDefinitionDto toDefinitionDto(ProcessDefinition definition) {
        return ProcessDefinitionDto.builder()
                .id(definition.getId())
                .key(definition.getKey())
                .name(definition.getName())
                .version(definition.getVersion())
                .build();
    }
}