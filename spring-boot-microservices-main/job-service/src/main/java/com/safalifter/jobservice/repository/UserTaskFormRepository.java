package com.safalifter.jobservice.repository;

import com.safalifter.jobservice.model.BpmnProcess;
import com.safalifter.jobservice.model.UserTaskForm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserTaskFormRepository extends JpaRepository<UserTaskForm, Long> {
    
    List<UserTaskForm> findByProcess(BpmnProcess process);
    
    List<UserTaskForm> findByProcessAndTaskId(BpmnProcess process, String taskId);
    
    Optional<UserTaskForm> findByProcessAndTaskIdAndTaskName(BpmnProcess process, String taskId, String taskName);
    
    List<UserTaskForm> findByAssignee(String assignee);
    
    List<UserTaskForm> findByCandidateGroupsContaining(String group);
}
