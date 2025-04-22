package com.safalifter.jobservice.service;

import com.safalifter.jobservice.dto.ProcessCreateRequest;
import com.safalifter.jobservice.dto.ProcessDTO;
import com.safalifter.jobservice.model.BpmnProcess;
import com.safalifter.jobservice.repository.BpmnProcessRepository;
import com.safalifter.jobservice.util.BpmnXmlHelper;
import org.camunda.bpm.engine.RepositoryService;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.model.bpmn.BpmnModelInstance;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BpmnProcessServiceTest {

    @Mock
    private BpmnProcessRepository bpmnProcessRepository;
    
    @Mock
    private RepositoryService repositoryService;
    
    @Mock
    private RuntimeService runtimeService;
    
    @Mock
    private BpmnXmlHelper bpmnXmlHelper;
    
    @Mock
    private ModelMapper modelMapper;

    @InjectMocks
    private BpmnModelService bpmnModelService;

    private BpmnProcess bpmnProcess;
    private ProcessCreateRequest processCreateRequest;
    private ProcessDTO processDTO;
    private final String processKey = "process-" + UUID.randomUUID().toString().substring(0, 8);
    private final Long processDbId = 1L;

    @BeforeEach
    void setUp() {
        // Initialiser les objets de test
        bpmnProcess = new BpmnProcess();
        bpmnProcess.setId(processDbId);
        bpmnProcess.setProcessKey(processKey);
        bpmnProcess.setName("Test Process");
        bpmnProcess.setDescription("Test Description");
        bpmnProcess.setVersion(1);
        bpmnProcess.setActive(true);
        bpmnProcess.setCreatedAt(LocalDateTime.now());
        bpmnProcess.setLastModifiedAt(LocalDateTime.now());
        
        processCreateRequest = new ProcessCreateRequest();
        processCreateRequest.setName("Test Process");
        processCreateRequest.setDescription("Test Description");
        
        processDTO = new ProcessDTO();
        processDTO.setId(processDbId);
        processDTO.setProcessKey(processKey);
        processDTO.setName("Test Process");
        processDTO.setDescription("Test Description");
        processDTO.setVersion(1);
        processDTO.setActive(true);
    }

    @Test
    void testGetProcessById() {
        // Given
        when(bpmnProcessRepository.findById(processDbId)).thenReturn(Optional.of(bpmnProcess));

        // When
        BpmnProcess result = bpmnModelService.getProcessById(processDbId);

        // Then
        assertNotNull(result);
        assertEquals(processDbId, result.getId());
        assertEquals(processKey, result.getProcessKey());
        verify(bpmnProcessRepository, times(1)).findById(processDbId);
    }
    
    @Test
    void testGetLatestProcessByKey() {
        // Given
        when(bpmnProcessRepository.findLatestVersionByProcessKey(processKey)).thenReturn(Optional.of(bpmnProcess));

        // When
        BpmnProcess result = bpmnModelService.getLatestProcessByKey(processKey);

        // Then
        assertNotNull(result);
        assertEquals(processDbId, result.getId());
        assertEquals(processKey, result.getProcessKey());
        verify(bpmnProcessRepository, times(1)).findLatestVersionByProcessKey(processKey);
    }
}
