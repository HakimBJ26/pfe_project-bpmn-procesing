package com.example.workflow.controller;

import com.example.workflow.dto.UpdateWorkflowRequest;
import com.example.workflow.dto.WorkflowRequest;
import com.example.workflow.model.Workflow;
import com.example.workflow.service.WorkflowService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import javax.persistence.EntityNotFoundException;
import javax.validation.Valid;
import java.util.List;
import java.util.Map;

/**
 * REST controller for handling HTTP requests related to Workflow entities.
 * Provides endpoints for CRUD operations on workflows.
 */
@RestController
@RequestMapping("/workflows")
public class WorkflowController {
    
    // Logger for this class to track API calls and errors
    private static final Logger logger = LoggerFactory.getLogger(WorkflowController.class);
    
    // Service dependency for business logic operations
    @Autowired
    private WorkflowService workflowService;
    

    /**
     * Retrieves all workflows.
     * 
     * @return ResponseEntity containing a list of all workflows
     */
    @GetMapping
    public ResponseEntity<List<Workflow>> getAllWorkflows() {
        logger.info("REST request to get all workflows");
        try {
            List<Workflow> workflows = workflowService.getAllWorkflows();
            logger.info("Retrieved {} workflows", workflows.size());
            return ResponseEntity.ok(workflows);
        } catch (Exception e) {
            logger.error("Error retrieving all workflows: {}", e.getMessage(), e);
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR, 
                "An error occurred while retrieving workflows: " + e.getMessage(), 
                e
            );
        }
    }

    /**
     * Retrieves a specific workflow by its ID.
     * 
     * @param id The String of the workflow to retrieve
     * @return ResponseEntity containing the requested workflow
     */
    @GetMapping("/{id}")
    public ResponseEntity<Workflow> getWorkflowById(@PathVariable String id) {
        logger.info("REST request to get workflow with ID: {}", id);
        try {
            Workflow workflow = workflowService.getWorkflowById(id);
            logger.info("Retrieved workflow with ID: {}", id);
            return ResponseEntity.ok(workflow);
        } catch (EntityNotFoundException e) {
            logger.error("Workflow not found with ID: {}", id);
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND, 
                e.getMessage(), 
                e
            );
        } catch (IllegalArgumentException e) {
            logger.error("Invalid argument for workflow ID: {}", id);
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, 
                e.getMessage(), 
                e
            );
        } catch (Exception e) {
            logger.error("Error retrieving workflow with ID {}: {}", id, e.getMessage(), e);
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR, 
                "An error occurred while retrieving the workflow: " + e.getMessage(), 
                e
            );
        }   
    }

    @GetMapping("/{id}/tasks")
    public ResponseEntity<Map<String, List<Map<String, Object>>>> getWorkflowTasksById(@PathVariable String id) {
        logger.info("REST request to get workflow tasks with ID: {}", id);
        try {
            logger.info("Retrieved workflow tasks with ID: {}", id);
            return ResponseEntity.ok(workflowService.getWorkflowTasksById(id));
        } catch (EntityNotFoundException e) {
            logger.error("Workflow not found with ID: {}", id);
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND, 
                e.getMessage(), 
                e
            );
        } catch (IllegalArgumentException e) {
            logger.error("Invalid argument for workflow ID: {}", id);
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, 
                e.getMessage(), 
                e
            );
        } catch (Exception e) {
            logger.error("Error retrieving workflow with ID {}: {}", id, e.getMessage(), e);
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR, 
                "An error occurred while retrieving the workflow: " + e.getMessage(), 
                e
            );
        }   
    }
    /**
     * Creates a new workflow.
     * 
     * @param workflowRequest The DTO containing workflow data
     * @return ResponseEntity containing the newly created workflow
     */
    @PostMapping
    public ResponseEntity<Workflow> createWorkflow(@Valid @RequestBody WorkflowRequest workflowRequest) {
        logger.info("REST request to create a new workflow");
        try {
            Workflow createdWorkflow = workflowService.createWorkflow(workflowRequest);
            logger.info("Created workflow with ID: {}", createdWorkflow.getId());
            return new ResponseEntity<>(createdWorkflow, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid workflow request: {}", e.getMessage());
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, 
                e.getMessage(), 
                e
            );
        } catch (Exception e) {
            logger.error("Error creating workflow: {}", e.getMessage(), e);
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR, 
                "An error occurred while creating the workflow: " + e.getMessage(), 
                e
            );
        }
    }

    /**
     * Updates an existing workflow.
     * 
     * @param id The String of the workflow to update
     * @param workflowRequest The DTO containing updated workflow data
     * @return ResponseEntity containing the updated workflow
     */
    @PutMapping("/{id}")
    public ResponseEntity<Workflow> updateWorkflow(
            @PathVariable String id, 
            @Valid @RequestBody UpdateWorkflowRequest workflowRequest) {
        logger.info("REST request to update workflow with ID: {}", id);
        try {
            Workflow updatedWorkflow = workflowService.updateWorkflow(id, workflowRequest);
            logger.info("Updated workflow with ID: {}", id);
            return ResponseEntity.ok(updatedWorkflow);
        } catch (EntityNotFoundException e) {
            logger.error("Workflow not found with ID: {}", id);
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND, 
                e.getMessage(), 
                e
            );
        } catch (IllegalArgumentException e) {
            logger.error("Invalid argument for workflow update: {}", e.getMessage());
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, 
                e.getMessage(), 
                e
            );
        } catch (Exception e) {
            logger.error("Error updating workflow with ID {}: {}", id, e.getMessage(), e);
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR, 
                "An error occurred while updating the workflow: " + e.getMessage(), 
                e
            );
        }
    }

    @PutMapping("/{id}/auto-fix-gateway-incoming-flow")
    public ResponseEntity<Workflow> autoFixGatewayIncomingFlow(
            @PathVariable String id) {
        logger.info("REST request to auto fix gateway incoming flow with ID: {}", id);
        try {
            Workflow updatedWorkflow = workflowService.autoFixGatewayIncomingFlow(id);
            logger.info("Updated workflow with ID: {}", id);
            return ResponseEntity.ok(updatedWorkflow);
        } catch (EntityNotFoundException e) {
            logger.error("Workflow not found with ID: {}", id);
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND, 
                e.getMessage(), 
                e
            );
        } catch (IllegalArgumentException e) {
            logger.error("Invalid argument for workflow update: {}", e.getMessage());
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, 
                e.getMessage(), 
                e
            );
        } catch (Exception e) {
            logger.error("Error updating workflow with ID {}: {}", id, e.getMessage(), e);
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR, 
                "An error occurred while updating the workflow: " + e.getMessage(), 
                e
            );
        }
    }

    /**
     * Deletes a workflow by its ID.
     * 
     * @param id The String of the workflow to delete
     * @return ResponseEntity with no content on successful deletion
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkflow(@PathVariable String id) {
        logger.info("REST request to delete workflow with ID: {}", id);
        try {
            workflowService.deleteWorkflow(id);
            logger.info("Deleted workflow with ID: {}", id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            logger.error("Workflow not found with ID: {}", id);
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND, 
                e.getMessage(), 
                e
            );
        } catch (IllegalArgumentException e) {
            logger.error("Invalid argument for workflow deletion: {}", e.getMessage());
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, 
                e.getMessage(), 
                e
            );
        } catch (Exception e) {
            logger.error("Error deleting workflow with ID {}: {}", id, e.getMessage(), e);
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR, 
                "An error occurred while deleting the workflow: " + e.getMessage(), 
                e
            );
        }
    }
}