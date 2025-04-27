package com.example.workflow.controller;

import com.example.workflow.dto.FormRequest;
import com.example.workflow.dto.FormUpdateRequest;
import com.example.workflow.exception.FormNotFoundException;
import com.example.workflow.model.Form;
import com.example.workflow.service.FormsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import javax.validation.Valid;

@RestController
@RequestMapping("/forms")
public class FormController {

    @Autowired
    private FormsService formService;

    // Create a new form
    @PostMapping
    public ResponseEntity<String> createForm(@Valid @RequestBody FormRequest form) {
        try {
            formService.createForm(form);
            return ResponseEntity.ok("Form added succesfully");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("An error occured while adding form !");
        }
    }

    // Get all forms
    @GetMapping
    public ResponseEntity<List<Form>> getAllForms() {
        List<Form> forms = formService.getAllForms();
        return ResponseEntity.ok(forms);
    }

    // Get a form by form_id
    @GetMapping("/{formKey}")
    public ResponseEntity<Form> getFormByKey(@PathVariable String formKey) {
        Form form = formService.getFormByKey(formKey);
        if (form != null) {
            return ResponseEntity.ok(form);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Update a form (both title and content)
    @PutMapping("/{formKey}")
    public ResponseEntity<Form> updateForm(
            @PathVariable String formKey,
            @RequestBody FormUpdateRequest updateRequest) {
        Form updatedForm = formService.updateForm(formKey, updateRequest);
        return ResponseEntity.ok(updatedForm);
    }

    

    
    
    // Delete a form by id
    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteFormById(@PathVariable String id) {
        try {
            formService.deleteFormById(id);
            return ResponseEntity.noContent().build();
        } catch (FormNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An error occurred while deleting the form: " + e.getMessage()));
        }
    }
}