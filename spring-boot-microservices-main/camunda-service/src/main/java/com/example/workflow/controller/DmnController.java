package com.example.workflow.controller;

import com.example.workflow.dto.DmnCreateDto;
import com.example.workflow.dto.DmnDto;
import com.example.workflow.service.DmnService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/dmn")
@RequiredArgsConstructor
@Tag(name = "DMN Management", description = "APIs for managing DMN decision tables")
public class DmnController {

    private final DmnService dmnService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create a new DMN decision table from file")
    public ResponseEntity<DmnDto> createDmnFromFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "name", required = false) String name) {
        try {
            String fileName = file.getOriginalFilename();
            // If name is not provided, use the file name without extension
            if (name == null || name.isEmpty()) {
                name = fileName.substring(0, fileName.lastIndexOf('.'));
            }
            
            String content = new String(file.getBytes(), StandardCharsets.UTF_8);
            DmnCreateDto dmnCreateDto = DmnCreateDto.builder()
                    .name(name)
                    .content(content)
                    .build();
            
            return ResponseEntity.ok(dmnService.createDmn(dmnCreateDto));
        } catch (IOException e) {
            throw new RuntimeException("Failed to process uploaded file", e);
        }
    }

    @GetMapping
    @Operation(summary = "Get all DMN decision tables")
    public ResponseEntity<List<DmnDto>> getAllDmns() {
        return ResponseEntity.ok(dmnService.getAllDmns());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a DMN decision table by ID")
    public ResponseEntity<DmnDto> getDmnById(@PathVariable String id) {
        return ResponseEntity.ok(dmnService.getDmnById(id));
    }

    // @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    // @Operation(summary = "Update a DMN decision table from file")
    // public ResponseEntity<DmnDto> updateDmnFromFile(
    //         @PathVariable String id,
    //         @RequestParam("file") MultipartFile file,
    //         @RequestParam(value = "name", required = false) String name) {
    //     try {
    //         String fileName = file.getOriginalFilename();
    //         // If name is not provided, use the file name without extension
    //         if (name == null || name.isEmpty()) {
    //             name = fileName.substring(0, fileName.lastIndexOf('.'));
    //         }
            
    //         String content = new String(file.getBytes(), StandardCharsets.UTF_8);
    //         DmnCreateDto dmnCreateDto = DmnCreateDto.builder()
    //                 .name(name)
    //                 .content(content)
    //                 .build();
            
    //         return ResponseEntity.ok(dmnService.updateDmn(id, dmnCreateDto));
    //     } catch (IOException e) {
    //         throw new RuntimeException("Failed to process uploaded file", e);
    //     }
    // }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Update a DMN decision table from JSON")
    public ResponseEntity<DmnDto> updateDmn(@PathVariable String id, @RequestBody DmnCreateDto dmnCreateDto) {
        return ResponseEntity.ok(dmnService.updateDmn(id, dmnCreateDto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a DMN decision table")
    public ResponseEntity<Void> deleteDmn(@PathVariable String id) {
        dmnService.deleteDmn(id);
        return ResponseEntity.ok().build();
    }
}