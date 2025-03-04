package com.safalifter.jobservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.safalifter.jobservice.dto.DynamicFormDto;
import com.safalifter.jobservice.model.DynamicForm;
import com.safalifter.jobservice.repository.DynamicFormRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DynamicFormService {
    private final DynamicFormRepository formRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public DynamicFormDto createForm(DynamicFormDto formDto) {
        DynamicForm form = new DynamicForm();
        form.setName(formDto.getName());
        form.setSchema(formDto.getSchema() != null ? formDto.getSchema().toString() : null);
        form.setUiSchema(formDto.getUiSchema() != null ? formDto.getUiSchema().toString() : null);
        form.setProcessDefinitionKey(formDto.getProcessDefinitionKey());
        form.setTaskDefinitionKey(formDto.getTaskDefinitionKey());
        
        DynamicForm savedForm = formRepository.save(form);
        return convertToDto(savedForm);
    }

    @Transactional(readOnly = true)
    public List<DynamicFormDto> getAllForms() {
        return formRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DynamicFormDto getFormById(String id) {
        return formRepository.findById(id)
                .map(this::convertToDto)
                .orElseThrow(() -> new RuntimeException("Form not found"));
    }

    @Transactional(readOnly = true)
    public List<DynamicFormDto> getFormsByProcessDefinition(String processDefinitionKey) {
        return formRepository.findByProcessDefinitionKey(processDefinitionKey).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DynamicFormDto getFormByProcessAndTask(String processDefinitionKey, String taskDefinitionKey) {
        return formRepository.findByProcessDefinitionKeyAndTaskDefinitionKey(processDefinitionKey, taskDefinitionKey)
                .map(this::convertToDto)
                .orElseThrow(() -> new RuntimeException("Form not found for process and task"));
    }

    @Transactional
    public DynamicFormDto updateForm(String id, DynamicFormDto formDto) {
        DynamicForm form = formRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Form not found"));
        
        form.setName(formDto.getName());
        form.setSchema(formDto.getSchema() != null ? formDto.getSchema().toString() : null);
        form.setUiSchema(formDto.getUiSchema() != null ? formDto.getUiSchema().toString() : null);
        form.setProcessDefinitionKey(formDto.getProcessDefinitionKey());
        form.setTaskDefinitionKey(formDto.getTaskDefinitionKey());
        
        DynamicForm updatedForm = formRepository.save(form);
        return convertToDto(updatedForm);
    }

    @Transactional
    public void deleteForm(String id) {
        formRepository.deleteById(id);
    }

    private DynamicFormDto convertToDto(DynamicForm form) {
        try {
            return DynamicFormDto.builder()
                    .id(form.getId())
                    .name(form.getName())
                    .schema(form.getSchema() != null ? objectMapper.readTree(form.getSchema()) : null)
                    .uiSchema(form.getUiSchema() != null ? objectMapper.readTree(form.getUiSchema()) : null)
                    .processDefinitionKey(form.getProcessDefinitionKey())
                    .taskDefinitionKey(form.getTaskDefinitionKey())
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Error converting form to DTO", e);
        }
    }
}
