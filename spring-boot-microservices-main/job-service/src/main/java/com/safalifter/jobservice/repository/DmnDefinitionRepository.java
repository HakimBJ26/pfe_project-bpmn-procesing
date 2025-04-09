package com.safalifter.jobservice.repository;

import com.safalifter.jobservice.model.DmnDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DmnDefinitionRepository extends JpaRepository<DmnDefinition, String> {
    Optional<DmnDefinition> findByDecisionKey(String decisionKey);
    List<DmnDefinition> findByDeployedTrue();
    List<DmnDefinition> findByName(String name);
    Optional<DmnDefinition> findTopByDecisionKeyOrderByVersionDesc(String decisionKey);
}
