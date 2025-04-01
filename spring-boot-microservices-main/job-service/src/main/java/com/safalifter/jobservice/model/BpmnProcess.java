package com.safalifter.jobservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "bpmn_processes")
public class BpmnProcess {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String processKey;
    
    @Column(nullable = false)
    private String deploymentId;
    
    @Column(nullable = false)
    private String processDefinitionId;
    
    @Column(nullable = false)
    private Integer version;
    
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String bpmnXml;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column
    private LocalDateTime lastModifiedAt;
    
    @Column
    private String description;
    
    @Column
    private String category;
    
    @Column
    private boolean isActive;
    
    @OneToMany(mappedBy = "process", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<UserTaskForm> userTaskForms = new HashSet<>();
    
    @OneToMany(mappedBy = "process", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ServiceTaskConfig> serviceTaskConfigs = new HashSet<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        lastModifiedAt = LocalDateTime.now();
        if (version == null) {
            version = 1;
        }
        isActive = true;
    }
    
    @PreUpdate
    protected void onUpdate() {
        lastModifiedAt = LocalDateTime.now();
    }
}
