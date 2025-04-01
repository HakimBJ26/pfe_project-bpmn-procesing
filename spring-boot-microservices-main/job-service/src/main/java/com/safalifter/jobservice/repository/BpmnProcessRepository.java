package com.safalifter.jobservice.repository;

import com.safalifter.jobservice.model.BpmnProcess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BpmnProcessRepository extends JpaRepository<BpmnProcess, Long> {
    
    Optional<BpmnProcess> findByProcessKey(String processKey);
    
    List<BpmnProcess> findByName(String name);
    
    List<BpmnProcess> findByIsActiveTrue();
    
    List<BpmnProcess> findByCategory(String category);
    
    @Query("SELECT p FROM BpmnProcess p WHERE p.processKey = :processKey AND p.version = " +
           "(SELECT MAX(p2.version) FROM BpmnProcess p2 WHERE p2.processKey = :processKey)")
    Optional<BpmnProcess> findLatestVersionByProcessKey(String processKey);
    
    List<BpmnProcess> findByProcessKeyOrderByVersionDesc(String processKey);
    
    Optional<BpmnProcess> findByDeploymentId(String deploymentId);
    
    Optional<BpmnProcess> findByProcessDefinitionId(String processDefinitionId);
}
