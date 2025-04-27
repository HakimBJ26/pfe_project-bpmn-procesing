package com.example.workflow.controller;

import com.example.workflow.exception.ProcessNotFoundException;
import com.example.workflow.service.ProcessService;
import com.example.workflow.dto.ProcessDefinitionDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
public class ProcessController {

    @Autowired
    private ProcessService processService;

    @GetMapping("/start-process")
    public ResponseEntity<String> startProcess(@RequestParam String processKey) {
        try {
            processService.startProcess(processKey);
            return ResponseEntity.ok("Process started with key: " + processKey);
        } catch (ProcessNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/list-processes")
    public ResponseEntity<List<ProcessDefinitionDTO>> listAllProcesses() {
        List<ProcessDefinitionDTO> processes = processService.listAllProcesses();
        return ResponseEntity.ok(processes);
    }

    /**
     * Changes the suspension state of a process
     * 
     * @param id      The ID of the process
     * @param suspend If true, suspends the process; if false, activates it
     * @return A response with the result of the operation
     */
    @PutMapping("/processes/{id}/state")
    public ResponseEntity<String> changeProcessState(
            @PathVariable String id,
            @RequestParam boolean suspend) {
        try {
            String result = processService.changeProcessSuspensionState(id, suspend);
            return ResponseEntity.ok(result);
        } catch (ProcessNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to change process state: " + e.getMessage());
        }
    }

    @GetMapping("/processes/{id}")
    public ResponseEntity<ProcessDefinitionDTO> getProcess(@PathVariable String id) {
        ProcessDefinitionDTO process = processService.getProcessById(id);
        return ResponseEntity.ok(process);
    }

    @PostMapping("/deploy-process")
    public ResponseEntity<String> deployProcess(
            @RequestParam("file") MultipartFile file) {
        // Call the service to handle file upload, deployment, and database storage
        String result = processService.uploadAndDeployBpmnFile(file);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/add-form")
    public ResponseEntity<String> addForm(
            @RequestParam("file") MultipartFile file) {
        try {
            // Call the service to handle file upload, deployment, and database storage
            String result = processService.uploadAndDeployFormFile(file);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            // Return a 400 Bad Request with the error message if something goes wrong
            return ResponseEntity.badRequest().body("Failed to upload form file: " + e.getMessage());
        }
    }

    @ExceptionHandler(ProcessNotFoundException.class)
    public ResponseEntity<String> handleProcessNotFoundException(ProcessNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
    }

}