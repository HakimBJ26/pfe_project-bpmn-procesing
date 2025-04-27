package com.example.workflow.service;

import com.example.workflow.dto.FormRequest;
import com.example.workflow.dto.FormUpdateRequest;
import com.example.workflow.exception.DuplicateFormException;
import com.example.workflow.exception.FormNotFoundException;
import com.example.workflow.model.Form;
import com.example.workflow.repository.FormRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class FormsService {

    @Autowired
    private FormRepository formRepository;

    public Form createForm(FormRequest formRequest) {
        Form form = new Form();
        form.setTitle(formRequest.getTitle());
        form.setFormKey(formRequest.getFormKey());
        form.setContent(formRequest.getContent());
        try {
            return formRepository.save(form);
        } catch (DataIntegrityViolationException e) {
            // Handle duplicate formKey or title
            throw new DuplicateFormException("Form with this key or title already exists");
        }
    }

    // Create or update a form
    public Form saveForm(Form form) {
        try {
            return formRepository.save(form);
        } catch (DataIntegrityViolationException e) {
            // Handle duplicate formKey or title
            throw new DuplicateFormException("Form with this key or title already exists");
        }
    }

    // Get all forms
    public List<Form> getAllForms() {
        return formRepository.findAll();
    }

    // Get a form by form_id
    public Form getFormByKey(String formKey) {
        return formRepository.findByFormKey(formKey)
                .orElseThrow(() -> new FormNotFoundException("Form not found with id: " + formKey));
    }

    // Get a form by title
    public Form getFormByTitle(String title) {
        return formRepository.findByTitle(title)
                .orElseThrow(() -> new FormNotFoundException("Form not found with title: " + title));
    }

    // Update a form's content by form_id
    public Form updateFormContent(String formKey, Map<String, Object> content) {
        Form existingForm = formRepository.findByFormKey(formKey)
                .orElseThrow(() -> new FormNotFoundException("Form not found with id: " + formKey));
        existingForm.setContent(content);
        return formRepository.save(existingForm);
    }

    // Update a form's title
    public Form updateFormTitle(String formKey, String title) {
        Form existingForm = formRepository.findByFormKey(formKey)
                .orElseThrow(() -> new FormNotFoundException("Form not found with id: " + formKey));
        
        // Check if the new title is already in use by another form
        if (formRepository.existsByTitle(title) && !existingForm.getTitle().equals(title)) {
            throw new DuplicateFormException("Form with title '" + title + "' already exists");
        }
        
        existingForm.setTitle(title);
        return formRepository.save(existingForm);
    }
    
    // Update both title and content in a single operation
    @Transactional
    public Form updateForm(String formKey, FormUpdateRequest updateRequest) {
        Form existingForm = formRepository.findByFormKey(formKey)
                .orElseThrow(() -> new FormNotFoundException("Form not found with id: " + formKey));
        
        // Update title if provided
        if (updateRequest.getTitle() != null && !updateRequest.getTitle().trim().isEmpty()) {
            String newTitle = updateRequest.getTitle();
            // Check if the new title is already in use by another form
            if (formRepository.existsByTitle(newTitle) && !existingForm.getTitle().equals(newTitle)) {
                throw new DuplicateFormException("Form with title '" + newTitle + "' already exists");
            }
            existingForm.setTitle(newTitle);
        }
        
        // Update content if provided
        if (updateRequest.getContent() != null) {
            existingForm.setContent(updateRequest.getContent());
        }
        
        return formRepository.save(existingForm);
    }

    // Delete a form by form_id
    public void deleteForm(String formKey) {
        if (!formRepository.existsByFormKey(formKey)) {
            throw new FormNotFoundException("Form not found with id: " + formKey);
        }
        formRepository.deleteByFormKey(formKey);
    }
    
    // Delete a form by id
    @Transactional
    public void deleteFormById(String id) {
        try {
            if (!formRepository.existsById(id)) {
                throw new FormNotFoundException("Form not found with id: " + id);
            }
            formRepository.deleteById(id);
        } catch (EmptyResultDataAccessException e) {
            throw new FormNotFoundException("Form not found with id: " + id);
        }
    }
}