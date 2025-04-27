package com.example.workflow.service;

import com.example.workflow.dto.FormRequest;
import com.example.workflow.dto.UpdateWorkflowRequest;
import com.example.workflow.dto.WorkflowRequest;
import com.example.workflow.model.Workflow;
import com.example.workflow.repository.WorkflowRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.camunda.bpm.engine.ParseException;
import org.camunda.bpm.model.bpmn.Bpmn;
import org.camunda.bpm.model.bpmn.BpmnModelInstance;
import org.camunda.bpm.model.bpmn.instance.BusinessRuleTask;
import org.camunda.bpm.model.bpmn.instance.ConditionExpression;
import org.camunda.bpm.model.bpmn.instance.ExclusiveGateway;
import org.camunda.bpm.model.bpmn.instance.ExtensionElements;
import org.camunda.bpm.model.bpmn.instance.FlowNode;
import org.camunda.bpm.model.bpmn.instance.Gateway;
import org.camunda.bpm.model.bpmn.instance.InclusiveGateway;
import org.camunda.bpm.model.bpmn.instance.ParallelGateway;
import org.camunda.bpm.model.bpmn.instance.SendTask;
import org.camunda.bpm.model.bpmn.instance.SequenceFlow;
import org.camunda.bpm.model.bpmn.instance.ServiceTask;
import org.camunda.bpm.model.bpmn.instance.Task;
import org.camunda.bpm.model.bpmn.instance.UserTask;
import org.camunda.bpm.model.bpmn.instance.bpmndi.BpmnDiagram;
import org.camunda.bpm.model.bpmn.instance.bpmndi.BpmnEdge;
import org.camunda.bpm.model.bpmn.instance.bpmndi.BpmnPlane;
import org.camunda.bpm.model.bpmn.instance.bpmndi.BpmnShape;
import org.camunda.bpm.model.xml.ModelValidationException;
import org.camunda.bpm.model.xml.instance.ModelElementInstance;
import org.springframework.transaction.annotation.Propagation;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import org.camunda.bpm.model.bpmn.instance.camunda.CamundaProperties;
import org.camunda.bpm.model.bpmn.instance.camunda.CamundaProperty;
import org.camunda.bpm.model.bpmn.instance.dc.Bounds;
import org.camunda.bpm.model.bpmn.instance.di.Waypoint;

import javax.persistence.EntityNotFoundException;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service class responsible for handling business logic related to Workflow
 * entities.
 * Implements CRUD operations and additional business rules for workflows.
 */
@Service
public class WorkflowService {

    // Logger for this class to track operations and errors
    private static final Logger logger = LoggerFactory.getLogger(WorkflowService.class);

    // Repository dependency for data access operations
    @Autowired
    private WorkflowRepository workflowRepository;

    @Autowired
    private FormsService formService;

    private boolean isValidBpmn(String fileContent) {
        try {
            // Parse the BPMN file content to validate its syntax
            BpmnModelInstance modelInstance = Bpmn
                    .readModelFromStream(new ByteArrayInputStream(fileContent.getBytes(StandardCharsets.UTF_8)));
            return modelInstance != null; // If parsing succeeds, the syntax is valid
        } catch (Exception e) {
            return false; // If parsing fails, the syntax is invalid
        }
    }

    /**
     * Auto fix gateway incoming flow
     * 
     * @param id
     * @return
     */

    // Helper method to find a BPMNShape by element ID
    private BpmnShape findBpmnShape(BpmnModelInstance modelInstance, String elementId) {
        Collection<BpmnShape> allShapes = modelInstance.getModelElementsByType(BpmnShape.class);
        for (BpmnShape shape : allShapes) {
            if (shape.getBpmnElement() != null && elementId.equals(shape.getBpmnElement().getId())) {
                return shape;
            }
        }
        return null;
    }

    // Helper method to find a BPMNEdge by element ID
    private BpmnEdge findBpmnEdge(BpmnModelInstance modelInstance, String elementId) {
        Collection<BpmnEdge> allEdges = modelInstance.getModelElementsByType(BpmnEdge.class);
        for (BpmnEdge edge : allEdges) {
            if (edge.getBpmnElement() != null && elementId.equals(edge.getBpmnElement().getId())) {
                return edge;
            }
        }
        return null;
    }

    @Transactional
    public Workflow autoFixGatewayIncomingFlow(String id) {
        Workflow workflow = getWorkflowById(id);
        workflow.setReadyToDeploy(false);

        // Parse the BPMN file content to validate its syntax
        BpmnModelInstance modelInstance = Bpmn
                .readModelFromStream(
                        new ByteArrayInputStream(workflow.getWorkflowContent().getBytes(StandardCharsets.UTF_8)));

        if (modelInstance == null) {
            throw new IllegalArgumentException("Invalid BPMN content");
        }

        // Check for gateways with up to two incoming flows not related to user tasks
        try {
            Collection<Gateway> gateways = modelInstance.getModelElementsByType(Gateway.class);
            for (Gateway gatewayElement : gateways) {
                Gateway gateway = (Gateway) gatewayElement;
                Collection<SequenceFlow> incomingFlows = gateway.getIncoming();
                Collection<SequenceFlow> outgoingFlows = gateway.getOutgoing();

                if (incomingFlows.size() == 1) {
                    // Create form JSON for the user task
                    ObjectMapper mapper = new ObjectMapper();
                    ObjectNode formJson = mapper.createObjectNode();

                    // Add form schema version and components array
                    formJson.put("schemaVersion", 10);
                    formJson.put("type", "default");
                    formJson.put("id", "Form_GatewayDecision");

                    ArrayNode components = formJson.putArray("components");

                    // Create select field
                    ObjectNode selectField = components.addObject();

                    selectField.put("type", "select");
                    selectField.put("id", "gatewayDecision");
                    selectField.put("label", "Select Decision");
                    selectField.put("key", "gatewayDecision");
                    selectField.put("validate", true);
                    selectField.put("required", true);

                    // Add options based on outgoing flows
                    ArrayNode values = selectField.putArray("values");

                    for (SequenceFlow flow : outgoingFlows) {
                        ObjectNode option = values.addObject();
                        option.put("value", flow.getId());
                        option.put("label", "Go to " + flow.getTarget().getName());
                        ConditionExpression conditionExpression = flow.getModelInstance()
                                .newInstance(ConditionExpression.class);
                        conditionExpression.setTextContent("${gatewayDecision=='" + flow.getId() + "'}");
                        flow.setConditionExpression(conditionExpression);
                    }

                    // Get the incoming flow to the gateway
                    SequenceFlow incomingFlow = incomingFlows.iterator().next();
                    FlowNode sourceNode = incomingFlow.getSource();

                    // Create a unique ID for the user task
                    String userTaskId = "UserTask_" + UUID.randomUUID().toString().substring(0, 8);

                    // Create and add the user task to the process first
                    UserTask userTask = modelInstance.newInstance(UserTask.class);
                    userTask.setId(userTaskId);
                    userTask.setName("Gateway decision");

                    // Important: Add the user task to the process before creating flows
                    sourceNode.getParentElement().addChildElement(userTask);

                    // Set form properties using Camunda Form JSON format
                    String formKey = "Form_" + UUID.randomUUID().toString().substring(0, 8);
                    userTask.setCamundaFormKey(formKey);

                    // Create and add extension elements
                    ExtensionElements extensionElements = modelInstance.newInstance(ExtensionElements.class);
                    userTask.setExtensionElements(extensionElements);

                    CamundaProperties camundaProperties = modelInstance.newInstance(CamundaProperties.class);
                    extensionElements.addChildElement(camundaProperties);

                    CamundaProperty formProperty = modelInstance.newInstance(CamundaProperty.class);
                    formProperty.setCamundaName("form");
                    formProperty.setCamundaValue(formJson.toString());
                    camundaProperties.addChildElement(formProperty);

                    // Create new sequence flows with unique IDs
                    String sourceToTaskFlowId = "Flow_" + UUID.randomUUID().toString().substring(0, 8);
                    String taskToGatewayFlowId = "Flow_" + UUID.randomUUID().toString().substring(0, 8);

                    // Create flow from source to user task
                    SequenceFlow sourceToTaskFlow = modelInstance.newInstance(SequenceFlow.class);
                    sourceToTaskFlow.setId(sourceToTaskFlowId);
                    gateway.getParentElement().addChildElement(sourceToTaskFlow);
                    sourceToTaskFlow.setSource(sourceNode);
                    sourceToTaskFlow.setTarget(userTask);

                    // Create flow from user task to gateway
                    SequenceFlow taskToGatewayFlow = modelInstance.newInstance(SequenceFlow.class);
                    taskToGatewayFlow.setId(taskToGatewayFlowId);
                    gateway.getParentElement().addChildElement(taskToGatewayFlow);
                    taskToGatewayFlow.setSource(userTask);
                    taskToGatewayFlow.setTarget(gateway);

                    // Get or create the BPMNDiagram element
                    BpmnDiagram diagram = null;
                    Collection<BpmnDiagram> diagrams = modelInstance.getModelElementsByType(BpmnDiagram.class);
                    if (diagrams.isEmpty()) {
                        diagram = modelInstance.newInstance(BpmnDiagram.class);
                        modelInstance.getDefinitions().addChildElement(diagram);
                    } else {
                        diagram = diagrams.iterator().next();
                    }

                    // Get or create the BPMNPlane element
                    BpmnPlane plane = null;
                    Collection<BpmnPlane> planes = diagram.getChildElementsByType(BpmnPlane.class);
                    if (planes.isEmpty()) {
                        plane = modelInstance.newInstance(BpmnPlane.class);
                        diagram.addChildElement(plane);
                    } else {
                        plane = planes.iterator().next();
                    }

                    // Get the source node shape to calculate positions
                    BpmnShape sourceShape = findBpmnShape(modelInstance, sourceNode.getId());
                    BpmnShape gatewayShape = findBpmnShape(modelInstance, gateway.getId());

                    if (sourceShape != null && gatewayShape != null) {
                        // Calculate position for the new user task (between source and gateway)
                        double sourceX = sourceShape.getBounds().getX();
                        double sourceY = sourceShape.getBounds().getY();
                        double gatewayX = gatewayShape.getBounds().getX();
                        double gatewayY = gatewayShape.getBounds().getY();

                        double userTaskX = (sourceX + gatewayX) / 2;
                        double userTaskY = (sourceY + gatewayY) / 2;

                        // Create BPMNShape for the user task
                        BpmnShape userTaskShape = modelInstance.newInstance(BpmnShape.class);
                        userTaskShape.setBpmnElement(userTask);

                        // Create bounds for the user task shape
                        Bounds userTaskBounds = modelInstance.newInstance(Bounds.class);
                        userTaskBounds.setX(userTaskX - 50); // Center the task
                        userTaskBounds.setY(userTaskY - 40);
                        userTaskBounds.setWidth(100);
                        userTaskBounds.setHeight(80);
                        userTaskShape.setBounds(userTaskBounds);

                        plane.addChildElement(userTaskShape);

                        // Create BPMNEdge for source to user task flow
                        BpmnEdge sourceToTaskEdge = modelInstance.newInstance(BpmnEdge.class);
                        sourceToTaskEdge.setBpmnElement(sourceToTaskFlow);

                        // Add waypoints for the edge
                        Waypoint sourceWaypoint = modelInstance.newInstance(Waypoint.class);
                        sourceWaypoint.setX(sourceX + sourceShape.getBounds().getWidth());
                        sourceWaypoint.setY(sourceY + sourceShape.getBounds().getHeight() / 2);
                        sourceToTaskEdge.addChildElement(sourceWaypoint);

                        Waypoint taskEntryWaypoint = modelInstance.newInstance(Waypoint.class);
                        taskEntryWaypoint.setX(userTaskX - 50);
                        taskEntryWaypoint.setY(userTaskY);
                        sourceToTaskEdge.addChildElement(taskEntryWaypoint);

                        plane.addChildElement(sourceToTaskEdge);

                        // Create BPMNEdge for user task to gateway flow
                        BpmnEdge taskToGatewayEdge = modelInstance.newInstance(BpmnEdge.class);
                        taskToGatewayEdge.setBpmnElement(taskToGatewayFlow);

                        // Add waypoints for the edge
                        Waypoint taskExitWaypoint = modelInstance.newInstance(Waypoint.class);
                        taskExitWaypoint.setX(userTaskX + 50);
                        taskExitWaypoint.setY(userTaskY);
                        taskToGatewayEdge.addChildElement(taskExitWaypoint);

                        Waypoint gatewayWaypoint = modelInstance.newInstance(Waypoint.class);
                        gatewayWaypoint.setX(gatewayX);
                        gatewayWaypoint.setY(gatewayY + gatewayShape.getBounds().getHeight() / 2);
                        taskToGatewayEdge.addChildElement(gatewayWaypoint);

                        plane.addChildElement(taskToGatewayEdge);
                    }

                    // Verify the connections are valid before removing the original flow
                    if (sourceNode != null && userTask != null && gateway != null &&
                            sourceToTaskFlow.getSource() != null && sourceToTaskFlow.getTarget() != null &&
                            taskToGatewayFlow.getSource() != null && taskToGatewayFlow.getTarget() != null) {

                        // Find and remove the BPMNEdge for the original flow
                        BpmnEdge originalEdge = findBpmnEdge(modelInstance, incomingFlow.getId());
                        if (originalEdge != null && originalEdge.getParentElement() != null) {
                            originalEdge.getParentElement().removeChildElement(originalEdge);
                        }

                        // Remove the original direct flow to gateway only after verifying new
                        // connections
                        incomingFlow.getParentElement().removeChildElement(incomingFlow);

                        // Update the collections to reflect the new structure
                        sourceNode.getOutgoing().remove(incomingFlow);
                        sourceNode.getOutgoing().add(sourceToTaskFlow);
                        userTask.getIncoming().add(sourceToTaskFlow);
                        userTask.getOutgoing().add(taskToGatewayFlow);
                        gateway.getIncoming().remove(incomingFlow);
                        gateway.getIncoming().add(taskToGatewayFlow);
                    } else {
                        throw new IllegalStateException("Failed to create valid connections between nodes");
                    }

                    FormRequest formRequest = new FormRequest();
                    formRequest.setTitle(
                            "Generated Form for Gateway Decision " + UUID.randomUUID().toString().substring(0, 8));
                    formRequest.setFormKey(formKey);
                    @SuppressWarnings("unchecked")
                    Map<String, Object> formMap = mapper.convertValue(formJson, Map.class);
                    formRequest.setContent(formMap);

                    formService.createForm(formRequest);
                }

            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            Bpmn.writeModelToStream(outputStream, modelInstance);
            workflow.setWorkflowContent(new String(outputStream.toByteArray(), StandardCharsets.UTF_8));

        } catch (Exception e) {
            logger.error("Error auto fixing gateway incoming flow: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to auto fix gateway incoming flow: " + e.getMessage(), e);
        }

        return workflowRepository.save(workflow);
    }

    /**
     * Retrieves all workflows from the database.
     * 
     * @return List of all workflows
     */
    @Transactional(readOnly = true)
    public List<Workflow> getAllWorkflows() {
        logger.info("Fetching all workflows");
        return workflowRepository.findAll();
    }

    /**
     * Retrieves a specific workflow by its ID.
     * 
     * @param id The String of the workflow to retrieve
     * @return The workflow if found
     * @throws EntityNotFoundException if the workflow with the given ID doesn't
     *                                 exist
     */
    @Transactional(readOnly = true)
    public Workflow getWorkflowById(String id) {
        logger.info("Fetching workflow with ID: {}", id);

        if (id == null) {
            logger.error("Workflow ID cannot be null");
            throw new IllegalArgumentException("Workflow ID cannot be null");
        }

        return workflowRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("Workflow not found with ID: {}", id);
                    return new EntityNotFoundException("Workflow not found with ID: " + id);
                });
    }

    @Transactional(readOnly = true)
    public Map<String, List<Map<String, Object>>> getWorkflowTasksById(String id) {
        logger.info("Fetching workflow tasks with ID: {}", id);

        if (id == null) {
            logger.error("Workflow ID cannot be null");
            throw new IllegalArgumentException("Workflow ID cannot be null");
        }

        Workflow workflow = workflowRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("Workflow not found with ID: {}", id);
                    return new EntityNotFoundException("Workflow not found with ID: " + id);
                });

        String workflowContent = workflow.getWorkflowContent();

        BpmnModelInstance modelInstance = Bpmn
                .readModelFromStream(new ByteArrayInputStream(workflowContent.getBytes(StandardCharsets.UTF_8)));

        // Extract all tasks and gateways from the BPMN model
        List<BusinessRuleTask> businessRuleTasks = (List<BusinessRuleTask>) modelInstance
                .getModelElementsByType(BusinessRuleTask.class);
        List<SendTask> sendTasks = (List<SendTask>) modelInstance.getModelElementsByType(SendTask.class);
        List<ServiceTask> serviceTasks = (List<ServiceTask>) modelInstance.getModelElementsByType(ServiceTask.class);
        List<UserTask> userTasks = (List<UserTask>) modelInstance.getModelElementsByType(UserTask.class);
        List<Gateway> gateways = (List<Gateway>) modelInstance.getModelElementsByType(Gateway.class);

        List<Map<String, Object>> tasksList = new ArrayList<>();
        List<Map<String, Object>> gatewaysList = new ArrayList<>();

        // Process tasks
        processTasks(businessRuleTasks, tasksList);
        processTasks(sendTasks, tasksList);
        processTasks(serviceTasks, tasksList);
        processTasks(userTasks, tasksList);

        // Process gateways
        for (Gateway gateway : gateways) {
            Map<String, Object> gatewayProperties = new HashMap<>();
            gatewayProperties.put("id", gateway.getId());
            gatewayProperties.put("name", gateway.getName());
            gatewayProperties.put("type", gateway.getElementType().getTypeName());

            // Determine gateway-specific properties
            if (gateway instanceof ExclusiveGateway) {
                gatewayProperties.put("gatewayDirection", "Diverging");
            } else if (gateway instanceof ParallelGateway) {
                gatewayProperties.put("gatewayDirection", "Parallel");
            } else if (gateway instanceof InclusiveGateway) {
                gatewayProperties.put("gatewayDirection", "Inclusive");
            }

            // Process extensions
            ExtensionElements extensionElements = gateway.getExtensionElements();
            if (extensionElements != null) {
                Map<String, Object> extensions = new HashMap<>();
                for (ModelElementInstance element : extensionElements.getElements()) {
                    extensions.put(element.getElementType().getTypeName(), element.getTextContent());
                }
                gatewayProperties.put("extensions", extensions);
            }

            // Process incoming and outgoing flows
            gatewayProperties.put("incoming", processFlows(gateway.getIncoming()));
            gatewayProperties.put("outgoing", processFlows(gateway.getOutgoing()));

            gatewaysList.add(gatewayProperties);
            logger.debug("Processed gateway: {}", gateway.getId());
        }

        Map<String, List<Map<String, Object>>> result = new HashMap<>();
        result.put("tasks", tasksList);
        result.put("gateways", gatewaysList);

        logger.info("Found {} tasks and {} gateways in workflow with ID: {}", tasksList.size(), gatewaysList.size(),
                id);
        return result;
    }

    // Helper method to process tasks
    private void processTasks(List<? extends Task> tasks, List<Map<String, Object>> tasksList) {
        for (Task task : tasks) {
            Map<String, Object> taskProperties = new HashMap<>();
            taskProperties.put("id", task.getId());
            taskProperties.put("name", task.getName());
            taskProperties.put("type", task.getElementType().getTypeName());

            // Add task-specific properties
            if (task instanceof ServiceTask) {
                taskProperties.put("delegateExpression", ((ServiceTask) task).getCamundaDelegateExpression());
            } else if (task instanceof SendTask) {
                taskProperties.put("delegateExpression", ((SendTask) task).getCamundaDelegateExpression());
            } else if (task instanceof BusinessRuleTask) {
                String delegateExpression = ((BusinessRuleTask) task).getCamundaDelegateExpression();
                String decisionRef = ((BusinessRuleTask) task).getCamundaDecisionRef();
                String resultVariable = ((BusinessRuleTask) task).getCamundaResultVariable();
                String decisionRefBinding = ((BusinessRuleTask) task).getCamundaDecisionRefBinding();
                String mapDecisionResult = ((BusinessRuleTask) task).getCamundaMapDecisionResult();
                if(delegateExpression != null){
                    taskProperties.put("delegateExpression", delegateExpression);
                    taskProperties.put("dmnImplementation", "delegateExpression");
                }else{
                    taskProperties.put("dmnImplementation", "DMN");
                    taskProperties.put("decisionRef", decisionRef);
                    taskProperties.put("resultVariable", resultVariable);
                    taskProperties.put("decisionRefBinding", decisionRefBinding);
                    taskProperties.put("mapDecisionResult", mapDecisionResult);
                }
            } else if (task instanceof UserTask) {
                taskProperties.put("formKey", ((UserTask) task).getCamundaFormKey());
            }

            // Process incoming and outgoing flows
            taskProperties.put("incoming", processFlows(task.getIncoming()));
            taskProperties.put("outgoing", processFlows(task.getOutgoing()));

            tasksList.add(taskProperties);
            logger.debug("Processed task: {}", task.getId());
        }
    }

    // Helper method to process flows
    private List<Map<String, String>> processFlows(Collection<SequenceFlow> flows) {
        return flows.stream()
                .map(flow -> {
                    Map<String, String> flowMap = new HashMap<>();
                    flowMap.put("id", flow.getId());
                    ConditionExpression conditionExpression = flow.getConditionExpression();
                    if (conditionExpression != null) {
                        flowMap.put("expression", conditionExpression.getTextContent());
                    } else {
                        flowMap.put("expression", "");
                    }
                    return flowMap;
                })
                .collect(Collectors.toList());
    }

    /**
     * Checks if a workflow with the given title already exists.
     * 
     * @param title The title to check
     * @return true if a workflow with the title exists, false otherwise
     */
    private boolean existsByTitle(String title) {
        return workflowRepository.existsByTitle(title);
    }

    /**
     * Checks if a workflow with the given title already exists, excluding a
     * specific workflow ID.
     * Used for update operations to allow a workflow to keep its own title.
     * 
     * @param title The title to check
     * @param id    The ID of the workflow to exclude from the check
     * @return true if another workflow with the title exists, false otherwise
     */
    private boolean existsByTitleExcludingId(String title, String id) {
        return workflowRepository.existsByTitleAndIdNot(title, id);
    }

    /**
     * Creates a new workflow based on the provided request data.
     * 
     * @param workflowRequest The DTO containing workflow data
     * @return The newly created workflow entity
     * @throws IllegalArgumentException if the request is null or contains invalid
     *                                  data
     */
    @Transactional
    public Workflow createWorkflow(WorkflowRequest workflowRequest) {
        logger.info("Creating new workflow");

        if (workflowRequest == null) {
            logger.error("Workflow request cannot be null");
            throw new IllegalArgumentException("Workflow request cannot be null");
        }
        String content = workflowRequest.getContent();
        if (content == null || content.trim().isEmpty()) {
            logger.error("Workflow content cannot be empty");
            throw new IllegalArgumentException("Workflow content cannot be empty");
        }

        if (!isValidBpmn(content)) {
            logger.error("Invalid BPMN content");
            throw new IllegalArgumentException("Invalid BPMN content");
        }

        if (workflowRequest.getTitle() == null || workflowRequest.getTitle().trim().isEmpty()) {
            logger.error("Workflow title cannot be empty");
            throw new IllegalArgumentException("Workflow title cannot be empty");
        }

        // Check if title is already in use
        if (existsByTitle(workflowRequest.getTitle())) {
            logger.error("Workflow title '{}' is already in use", workflowRequest.getTitle());
            throw new IllegalArgumentException("Workflow title '" + workflowRequest.getTitle() + "' is already in use");
        }

        try {
            Workflow workflow = new Workflow();
            workflow.setTitle(workflowRequest.getTitle());
            workflow.setWorkflowContent(content);
            workflow.setReadyToDeploy(false);
            Workflow savedWorkflow = workflowRepository.save(workflow);
            logger.info("Successfully created workflow with ID: {}", savedWorkflow.getId());
            return savedWorkflow;
        } catch (Exception e) {
            logger.error("Error creating workflow: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create workflow: " + e.getMessage(), e);
        }
    }

    /**
     * Updates an existing workflow with new data.
     * 
     * @param id              The String of the workflow to update
     * @param workflowRequest The DTO containing updated workflow data
     * @return The updated workflow entity
     * @throws EntityNotFoundException  if the workflow with the given ID doesn't
     *                                  exist
     * @throws IllegalArgumentException if the request is null or contains invalid
     *                                  data
     */
    @Transactional
    public Workflow updateWorkflow(String id, UpdateWorkflowRequest workflowRequest) {
        logger.info("Updating workflow with ID: {}", id);

        // Check if title is already in use by another workflow
        if (workflowRequest.getTitle() != null && existsByTitleExcludingId(workflowRequest.getTitle(), id)) {
            logger.error("Workflow title '{}' is already in use by another workflow", workflowRequest.getTitle());
            throw new IllegalArgumentException(
                    "Workflow title '" + workflowRequest.getTitle() + "' is already in use by another workflow");
        }

        // Get the existing workflow or throw EntityNotFoundException
        Workflow workflow = getWorkflowById(id);

        // Update basic properties
        updateBasicProperties(workflow, workflowRequest);

        // Update BPMN model if there's content or config to update
        if (workflowRequest.getContent() != null ||
                (workflowRequest.getConfig() != null && !workflowRequest.getConfig().isEmpty())) {
            try {
                String updatedContent = updateBpmnModel(workflow, workflowRequest);
                workflow.setWorkflowContent(updatedContent);

                // Validate BPMN content without deployment
                if (validateBpmnContent(updatedContent)) {
                    workflow.setReadyToDeploy(true);
                    logger.info("Workflow with ID {} is valid and ready to deploy", workflow.getId());
                } else {
                    workflow.setReadyToDeploy(false);
                    logger.warn("Workflow validation failed, marking as not ready to deploy");
                }
            } catch (Exception e) {
                logger.error("Error processing BPMN model: {}", e.getMessage());
                workflow.setReadyToDeploy(false);
                // Don't throw the exception, just mark as not ready to deploy
            }
        }

        // Save and return the updated workflow
        try {
            return workflowRepository.save(workflow);
        } catch (Exception e) {
            logger.error("Error saving workflow with ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Failed to save workflow: " + e.getMessage(), e);
        }
    }

    private void updateBasicProperties(Workflow workflow, UpdateWorkflowRequest workflowRequest) {
        if (workflowRequest.getTitle() != null) {
            workflow.setTitle(workflowRequest.getTitle());
        }
        if (workflowRequest.getContent() != null) {
            workflow.setWorkflowContent(workflowRequest.getContent());
        }
    }

    private String updateBpmnModel(Workflow workflow, UpdateWorkflowRequest workflowRequest) {
        String workflowContent = workflow.getWorkflowContent();
        BpmnModelInstance modelInstance = Bpmn.readModelFromStream(
                new ByteArrayInputStream(workflowContent.getBytes(StandardCharsets.UTF_8)));

        if (workflowRequest.getConfig() != null) {
            for (UpdateWorkflowRequest.ConfigItem config : workflowRequest.getConfig()) {
                ModelElementInstance element = modelInstance.getModelElementById(config.getId());
                if (element == null) {
                    logger.warn("Could not find element with ID: {}", config.getId());
                    continue;
                }
                updateElementConfiguration(element, config);
            }
        }

        try {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            Bpmn.writeModelToStream(outputStream, modelInstance);
            return new String(outputStream.toByteArray(), StandardCharsets.UTF_8);
        } catch (Exception e) {
            logger.error("Failed to write BPMN model: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to update BPMN model: " + e.getMessage(), e);
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    private boolean validateBpmnContent(String bpmnContent) {
        try {
            // Basic BPMN model validation
            BpmnModelInstance modelInstance = Bpmn.readModelFromStream(
                    new ByteArrayInputStream(bpmnContent.getBytes(StandardCharsets.UTF_8)));

            // Validate the model structure
            Bpmn.validateModel(modelInstance);
            return true;
        } catch (ModelValidationException | ParseException e) {
            logger.warn("BPMN validation failed: {}", e.getMessage());
            return false;
        } catch (Exception e) {
            logger.warn("Unexpected error during BPMN validation: {}", e.getMessage());
            return false;
        }
    }

    private void updateElementConfiguration(ModelElementInstance element, UpdateWorkflowRequest.ConfigItem config) {
        switch (config.getType()) {
            case USER_TASK:
                updateUserTask((UserTask) element, config);
                break;
            case SERVICE_TASK:
                updateServiceTask((ServiceTask) element, config);
                break;
            case BUSINESS_RULE_TASK:
                updateBusinessRuleTask((BusinessRuleTask) element, config);
                break;
            case SEND_TASK:
                updateSendTask((SendTask) element, config);
                break;
            case EXCLUSIVE_GATEWAY:
                updateExclusiveGateway((ExclusiveGateway) element, config);
                break;
            case SEQUENCE_FLOW:
                updateSequenceFlow((SequenceFlow) element, config);
                break;
            default:
                logger.warn("Unsupported element type: {}", config.getType());
        }
    }

    private void updateUserTask(UserTask userTask, UpdateWorkflowRequest.ConfigItem config) {
        if (config.getAttribute() == UpdateWorkflowRequest.AttributeType.FORM_KEY) {
            userTask.setCamundaFormKey(config.getAttributeValue());
        } else if (config.getAttribute() == UpdateWorkflowRequest.AttributeType.NAME) {
            userTask.setName(config.getAttributeValue());
        }
    }

    private void updateServiceTask(ServiceTask serviceTask, UpdateWorkflowRequest.ConfigItem config) {
        if (config.getAttribute() == UpdateWorkflowRequest.AttributeType.DELEGATE_EXPRESSION) {
            serviceTask.setCamundaDelegateExpression(config.getAttributeValue());
        } else if (config.getAttribute() == UpdateWorkflowRequest.AttributeType.NAME) {
            serviceTask.setName(config.getAttributeValue());
        }
    }

    private void updateBusinessRuleTask(BusinessRuleTask businessRuleTask, UpdateWorkflowRequest.ConfigItem config) {
        if (config.getAttribute() == UpdateWorkflowRequest.AttributeType.DELEGATE_EXPRESSION) {
            businessRuleTask.setCamundaDelegateExpression(config.getAttributeValue());
        } else if (config.getAttribute() == UpdateWorkflowRequest.AttributeType.NAME) {
            businessRuleTask.setName(config.getAttributeValue());
        } else if (config.getAttribute() == UpdateWorkflowRequest.AttributeType.DMN_IMPLEMENTATION) {
            businessRuleTask.setCamundaDecisionRef(config.getAttributeValue());
            businessRuleTask.setCamundaResultVariable(config.getResultVariable());
            businessRuleTask.setCamundaDecisionRefBinding("latest");
            businessRuleTask.setCamundaMapDecisionResult("singleEntry");
        }
    }

    private void updateSendTask(SendTask sendTask, UpdateWorkflowRequest.ConfigItem config) {
        if (config.getAttribute() == UpdateWorkflowRequest.AttributeType.DELEGATE_EXPRESSION) {
            sendTask.setCamundaDelegateExpression(config.getAttributeValue());
        } else if (config.getAttribute() == UpdateWorkflowRequest.AttributeType.NAME) {
            sendTask.setName(config.getAttributeValue());
        }
    }

    private void updateExclusiveGateway(ExclusiveGateway gateway, UpdateWorkflowRequest.ConfigItem config) {
        if (config.getAttribute() == UpdateWorkflowRequest.AttributeType.NAME) {
            gateway.setName(config.getAttributeValue());
        }
    }

    private void updateSequenceFlow(SequenceFlow sequenceFlow, UpdateWorkflowRequest.ConfigItem config) {
        if (config.getAttribute() == UpdateWorkflowRequest.AttributeType.FLOW_EXPRESSION) {
            String expressionValue = config.getAttributeValue();
            if (expressionValue != null) {
                if (!expressionValue.trim().isEmpty()) {
                    ConditionExpression conditionExpression = sequenceFlow.getModelInstance()
                            .newInstance(ConditionExpression.class);
                    conditionExpression.setTextContent(expressionValue);
                    sequenceFlow.setConditionExpression(conditionExpression);
                } else {
                    sequenceFlow.setConditionExpression(null);
                }
            }
        } else if (config.getAttribute() == UpdateWorkflowRequest.AttributeType.NAME) {
            sequenceFlow.setName(config.getAttributeValue());
        }
    }

    /**
     * Deletes a workflow by its ID.
     * 
     * @param id The String of the workflow to delete
     * @throws EntityNotFoundException if the workflow with the given ID doesn't
     *                                 exist
     */
    @Transactional
    public void deleteWorkflow(String id) {
        logger.info("Deleting workflow with ID: {}", id);

        if (id == null) {
            logger.error("Workflow ID cannot be null");
            throw new IllegalArgumentException("Workflow ID cannot be null");
        }

        try {
            // First check if the workflow exists
            Workflow workflow = getWorkflowById(id);
            workflowRepository.delete(workflow);
            logger.info("Successfully deleted workflow with ID: {}", id);
        } catch (EntityNotFoundException e) {
            // Re-throw the exception from getWorkflowById
            throw e;
        } catch (Exception e) {
            logger.error("Error deleting workflow with ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Failed to delete workflow: " + e.getMessage(), e);
        }
    }

}