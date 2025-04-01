package com.safalifter.jobservice.model;

import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "service_task_configs")
public class ServiceTaskConfig {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String taskId;
    
    @Column(nullable = false)
    private String taskName;
    
    @Column
    private String implementation;
    
    @Column
    private String implementationType;
    
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String inputParameters;
    
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String outputParameters;
    
    @ManyToOne
    @JoinColumn(name = "process_id", nullable = false)
    private BpmnProcess process;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column
    private LocalDateTime lastModifiedAt;
    
    @Column
    private Integer retries;
    
    @Column
    private String retryTimeout;
    
    @Column
    private Boolean asyncBefore;
    
    @Column
    private Boolean asyncAfter;
    
    @Column
    private Boolean exclusive;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        lastModifiedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        lastModifiedAt = LocalDateTime.now();
    }
}
