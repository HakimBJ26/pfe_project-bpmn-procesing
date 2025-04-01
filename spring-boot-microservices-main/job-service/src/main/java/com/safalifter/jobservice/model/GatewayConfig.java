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
@Table(name = "gateway_configs")
public class GatewayConfig {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String gatewayId;
    
    @Column(nullable = false)
    private String gatewayName;
    
    @Column(nullable = false)
    private String gatewayType;  // exclusive, inclusive, parallel, etc.
    
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String conditions;  // JSON serialized conditions for each sequence flow
    
    @Column
    private String defaultFlow;  // ID of the default sequence flow
    
    @ManyToOne
    @JoinColumn(name = "process_id", nullable = false)
    private BpmnProcess process;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column
    private LocalDateTime lastModifiedAt;
    
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
