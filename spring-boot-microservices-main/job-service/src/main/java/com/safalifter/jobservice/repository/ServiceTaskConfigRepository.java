package com.safalifter.jobservice.repository;

import com.safalifter.jobservice.model.BpmnProcess;
import com.safalifter.jobservice.model.ServiceTaskConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceTaskConfigRepository extends JpaRepository<ServiceTaskConfig, Long> {
    
    List<ServiceTaskConfig> findByProcess(BpmnProcess process);
    
    List<ServiceTaskConfig> findByProcessAndTaskId(BpmnProcess process, String taskId);
    
    Optional<ServiceTaskConfig> findByProcessAndTaskIdAndTaskName(BpmnProcess process, String taskId, String taskName);
    
    List<ServiceTaskConfig> findByImplementation(String implementation);
    
    List<ServiceTaskConfig> findByImplementationType(String implementationType);
}
