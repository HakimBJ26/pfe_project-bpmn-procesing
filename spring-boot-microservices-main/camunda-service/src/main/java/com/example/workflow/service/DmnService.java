package com.example.workflow.service;

import com.example.workflow.dto.DmnCreateDto;
import com.example.workflow.dto.DmnDto;
import lombok.RequiredArgsConstructor;
import org.camunda.bpm.engine.RepositoryService;
import org.camunda.bpm.engine.repository.DecisionDefinition;
import org.camunda.bpm.engine.repository.Deployment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DmnService {

    private final RepositoryService repositoryService;

    @Transactional
    public DmnDto createDmn(DmnCreateDto dmnCreateDto) {
        Deployment deployment = repositoryService.createDeployment()
                .addInputStream(dmnCreateDto.getName() + ".dmn", new ByteArrayInputStream(dmnCreateDto.getContent().getBytes()))
                .name(dmnCreateDto.getName())
                .deploy();

        DecisionDefinition decisionDefinition = repositoryService.createDecisionDefinitionQuery()
                .deploymentId(deployment.getId())
                .singleResult();

        return mapToDto(decisionDefinition, deployment.getId());
    }

    @Transactional(readOnly = true)
    public List<DmnDto> getAllDmns() {
        return repositoryService.createDecisionDefinitionQuery()
                .list()
                .stream()
                .map(def -> mapToDto(def, def.getDeploymentId()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DmnDto getDmnById(String id) {
        DecisionDefinition decisionDefinition = repositoryService.createDecisionDefinitionQuery()
                .decisionDefinitionId(id)
                .singleResult();
        return mapToDto(decisionDefinition, decisionDefinition.getDeploymentId());
    }

    @Transactional
    public void deleteDmn(String id) {
        DecisionDefinition decisionDefinition = repositoryService.createDecisionDefinitionQuery()
                .decisionDefinitionId(id)
                .singleResult();
        repositoryService.deleteDeployment(decisionDefinition.getDeploymentId(), true);
    }

    @Transactional
    public DmnDto updateDmn(String id, DmnCreateDto dmnCreateDto) {
        // First delete the existing DMN
        deleteDmn(id);
        // Then create a new one
        return createDmn(dmnCreateDto);
    }

    private DmnDto mapToDto(DecisionDefinition decisionDefinition, String deploymentId) {
        try {
            return DmnDto.builder()
                    .id(decisionDefinition.getId())
                    .name(decisionDefinition.getName())
                    .key(decisionDefinition.getKey())
                    .version(String.valueOf(decisionDefinition.getVersion()))
                    .deploymentId(deploymentId)
                    .content(new String(repositoryService.getResourceAsStream(
                            deploymentId,
                            decisionDefinition.getResourceName()).readAllBytes()))
                    .build();
        } catch (IOException e) {
            throw new RuntimeException("Failed to read DMN content", e);
        }
    }
}