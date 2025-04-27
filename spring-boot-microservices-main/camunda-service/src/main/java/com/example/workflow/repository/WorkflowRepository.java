package com.example.workflow.repository;

import com.example.workflow.model.Workflow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkflowRepository extends JpaRepository<Workflow, String> {
    
    /**
     * Checks if a workflow with the given title exists.
     * 
     * @param title The title to check
     * @return true if a workflow with the title exists, false otherwise
     */
    boolean existsByTitle(String title);
    
    /**
     * Checks if a workflow with the given title exists, excluding a specific workflow ID.
     * 
     * @param title The title to check
     * @param id The ID of the workflow to exclude from the check
     * @return true if another workflow with the title exists, false otherwise
     */
    boolean existsByTitleAndIdNot(String title, String id);
}