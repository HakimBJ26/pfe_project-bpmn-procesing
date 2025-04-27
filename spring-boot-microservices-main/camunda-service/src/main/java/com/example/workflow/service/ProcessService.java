package com.example.workflow.service;

import com.example.workflow.exception.CustomException;
import com.example.workflow.exception.ProcessNotFoundException;
import com.example.workflow.dto.ProcessDefinitionDTO;

import org.camunda.bpm.engine.ParseException;
import org.camunda.bpm.engine.RepositoryService;
import org.camunda.bpm.engine.repository.Deployment;
import org.camunda.bpm.model.bpmn.Bpmn;
import org.camunda.bpm.model.bpmn.BpmnModelInstance;
import org.camunda.bpm.model.bpmn.instance.BusinessRuleTask;
import org.camunda.bpm.model.bpmn.instance.FlowNode;
import org.camunda.bpm.model.bpmn.instance.Gateway;
import org.camunda.bpm.model.bpmn.instance.SequenceFlow;
import org.camunda.bpm.model.bpmn.instance.UserTask;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.exception.NullValueException;
import org.camunda.bpm.engine.exception.NotFoundException;
import java.util.stream.Collectors;
import org.camunda.bpm.engine.repository.ProcessDefinition;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.util.Collection;
import java.util.List;

@Service
public class ProcessService {

    @Autowired
    private RepositoryService repositoryService;

    @Autowired
    private RuntimeService runtimeService;

    private final Path formsLocation = Paths.get("src/main/resources/static/forms");

    public void init() {
        try {
            if (!Files.exists(formsLocation)) {
                Files.createDirectories(formsLocation); // Create the folder if it doesn't exist
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize folder for upload!", e);
        }
    }

    public String uploadAndDeployFormFile(MultipartFile file) {
        try {
            init();

            String formFileName = file.getOriginalFilename();
            Path formFilePath = formsLocation.resolve(formFileName);
            Files.write(formFilePath, file.getBytes());

            return "Form uploaded successfully: " + formFileName;
        } catch (Exception e) {
            throw new RuntimeException("Error uploading and deploying Form file.", e);
        }
    }

    private void validateWorkflowConfiguration(String fileContent) {
        // Parse the BPMN file content to validate its syntax
        BpmnModelInstance modelInstance = Bpmn
                .readModelFromStream(new ByteArrayInputStream(fileContent.getBytes(StandardCharsets.UTF_8)));

        if(modelInstance == null){
            throw new IllegalArgumentException("Invalid BPMN content");
        }

        // Check for gateways with up to two incoming flows not related to user tasks
        Collection<Gateway> gateways = modelInstance.getModelElementsByType(Gateway.class);
        for (Gateway gatewayElement : gateways) {
            Gateway gateway = (Gateway) gatewayElement;
            Collection<SequenceFlow> incomingFlows = gateway.getIncoming();
            
            // Check gateways with up to two incoming flows
            if (incomingFlows.size() < 2) {
                boolean hasNonUserTaskSource = false;
                
                for (SequenceFlow flow : incomingFlows) {
                    FlowNode source = flow.getSource();
                    // Check if the source is not a UserTask
                    if (!(source instanceof UserTask) && !(source instanceof BusinessRuleTask)) {
                        hasNonUserTaskSource = true;
                        break;
                    }
                }
                
                if (hasNonUserTaskSource) {
                    String gatewayName = gateway.getName() != null ? gateway.getName() : gateway.getId();
                    throw new IllegalArgumentException("Invalid workflow configuration: Gateway " + gatewayName + " has incoming flows not valid, this is not allowed because the gateway need to get variable to make a decision , please check the workflow configuration or you can use autofix method to fix this configuration");
                }
            }
        }
    }
    

    public String uploadAndDeployBpmnFile(MultipartFile file) {
        try {
            // Read the BPMN file content
            String fileContent = new String(file.getBytes(), StandardCharsets.UTF_8);

            // Validate the BPMN file syntax
            validateWorkflowConfiguration(fileContent);

            // Save the file to the processes folder
            String fileName = file.getOriginalFilename();

            // Deploy the BPMN file using Camunda
            Deployment deployment = repositoryService.createDeployment()
                    .addInputStream(fileName, new ByteArrayInputStream(file.getBytes())) // Use a new input stream
                    .deploy();

            // Extract process key from the deployed process
            String processKey = repositoryService.createProcessDefinitionQuery()
                    .deploymentId(deployment.getId())
                    .singleResult()
                    .getKey();

            return "File uploaded and deployed successfully. Process Key: " + processKey;
        } 
        catch (ParseException e) {
            throw new CustomException("This workflow is not ready to deploy , missing some required fields to configure.", 409, e.getMessage());
        }
        catch (IllegalArgumentException e) {
            throw e;
        }
        catch (IOException e) {
            throw new RuntimeException("Failed to read or save the BPMN file: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload and deploy BPMN file: " + e.getMessage(), e);
        }
    }

    public String updateBpmnFile(UUID processId, MultipartFile file) {
        try {
            // Ensure the upload folder exists

            // Read the new BPMN file content
            String newFileContent = new String(file.getBytes(), StandardCharsets.UTF_8);

            // Validate the new BPMN file syntax
            validateWorkflowConfiguration(newFileContent);

            // Save the new file to the processes folder
            String newFileName = file.getOriginalFilename();

            // Deploy the new BPMN file using Camunda
            Deployment deployment = repositoryService.createDeployment()
                    .addInputStream(newFileName, new ByteArrayInputStream(file.getBytes()))
                    .deploy();

            // Extract the new process key from the deployed process
            String newProcessKey = repositoryService.createProcessDefinitionQuery()
                    .deploymentId(deployment.getId())
                    .singleResult()
                    .getKey();

            return "Process updated successfully. New Process Key: " + newProcessKey;
        } catch (IOException e) {
            throw new RuntimeException("Failed to read or save the BPMN file: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new RuntimeException("Failed to update the BPMN file: " + e.getMessage(), e);
        }
    }

    public void startProcess(String processKey) {
        try {
            runtimeService.startProcessInstanceByKey(processKey);
            System.out.println("Process started with key: " + processKey);
        } catch (NullValueException | NotFoundException e) {
            throw new ProcessNotFoundException("Process with key '" + processKey + "' not found or not deployed.");
        }
    }

    /**
     * Changes the suspension state of a process definition
     * @param processId The ID of the process definition
     * @param suspend If true, suspends the process; if false, activates it
     * @return A message indicating the result of the operation
     */
    public String changeProcessSuspensionState(String processId, boolean suspend) {
        try {
            ProcessDefinition processDefinition = repositoryService.createProcessDefinitionQuery()
                    .processDefinitionId(processId)
                    .singleResult();
            
            if (processDefinition == null) {
                throw new ProcessNotFoundException("Process with id '" + processId + "' not found.");
            }
            
            // Check if the current state matches the requested state
            if (processDefinition.isSuspended() == suspend) {
                String state = suspend ? "suspended" : "active";
                return "Process is already in " + state + " state.";
            }
            
            // Change the suspension state
            if (suspend) {
                repositoryService.suspendProcessDefinitionById(processId);
                return "Process suspended successfully.";
            } else {
                repositoryService.activateProcessDefinitionById(processId);
                return "Process activated successfully.";
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to change process suspension state: " + e.getMessage(), e);
        }
    }

    public List<ProcessDefinitionDTO> listAllProcesses() {
        List<ProcessDefinition> processDefinitions = repositoryService.createProcessDefinitionQuery().list();

        return processDefinitions.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    private ProcessDefinitionDTO convertToDTO(ProcessDefinition processDefinition) {
        ProcessDefinitionDTO dto = new ProcessDefinitionDTO();
        dto.setId(processDefinition.getId());
        dto.setKey(processDefinition.getKey());
        dto.setName(processDefinition.getName());
        dto.setVersion(processDefinition.getVersion());
        dto.setResourceName(processDefinition.getResourceName());
        dto.setDeploymentId(processDefinition.getDeploymentId());
        dto.setDescription(processDefinition.getDescription());
        dto.setDiagramResourceName(processDefinition.getDiagramResourceName());
        dto.setSuspended(processDefinition.isSuspended());
        return dto;
    }

    public ProcessDefinitionDTO getProcessById(String processId) {
        // Get the process definition
        ProcessDefinition processDefinition = repositoryService.createProcessDefinitionQuery()
                .processDefinitionId(processId)
                .singleResult();

        if (processDefinition == null) {
            throw new ProcessNotFoundException("Process with id '" + processId + "' not found.");
        }

        // Convert to DTO
        ProcessDefinitionDTO processDTO = new ProcessDefinitionDTO();
        processDTO.setId(processDefinition.getId());
        processDTO.setKey(processDefinition.getKey());
        processDTO.setName(processDefinition.getName());
        processDTO.setVersion(processDefinition.getVersion());
        processDTO.setResourceName(processDefinition.getResourceName());
        processDTO.setDeploymentId(processDefinition.getDeploymentId());
        processDTO.setDescription(processDefinition.getDescription());
        processDTO.setDiagramResourceName(processDefinition.getDiagramResourceName());
        processDTO.setSuspended(processDefinition.isSuspended());

        // Get BPMN XML content
        try {
            InputStream bpmnStream = repositoryService.getProcessModel(processDefinition.getId());
            if (bpmnStream != null) {
                String bpmnXml = new String(bpmnStream.readAllBytes(), StandardCharsets.UTF_8);
                processDTO.setBpmnXml(bpmnXml);
            }
        } catch (IOException e) {
            throw new RuntimeException("Error reading BPMN XML: " + e.getMessage(), e);
        }

        // Get diagram image if available
        if (processDefinition.getDiagramResourceName() != null) {
            try {
                InputStream diagramStream = repositoryService.getProcessDiagram(processDefinition.getId());
                if (diagramStream != null) {
                    processDTO.setDiagramBytes(diagramStream.readAllBytes());
                }
            } catch (IOException e) {
                throw new RuntimeException("Error reading process diagram: " + e.getMessage(), e);
            }
        }

        return processDTO;
    }
}