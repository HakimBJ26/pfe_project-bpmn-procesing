package com.safalifter.jobservice.repository;

import com.safalifter.jobservice.model.DynamicForm;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DynamicFormRepository extends JpaRepository<DynamicForm, String> {
    List<DynamicForm> findByProcessDefinitionKey(String processDefinitionKey);
    Optional<DynamicForm> findByProcessDefinitionKeyAndTaskDefinitionKey(String processDefinitionKey, String taskDefinitionKey);
}
