package com.safalifter.jobservice.model;

/**
 * Classe de base pour toutes les entités.
 * Fournit des champs communs (id, dates de création et de mise à jour) pour 
 * l'intégration avec les composants Material UI qui utilisent ces informations temporelles.
 */

import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.MappedSuperclass;
import java.io.Serializable;
import java.time.LocalDateTime;

@MappedSuperclass
@Getter
@Setter
public abstract class BaseEntity implements Serializable {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private String id;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    // Méthodes de compatibilité pour les anciens noms de champs
    
    public LocalDateTime getCreationTimestamp() {
        return createdAt;
    }
    
    public void setCreationTimestamp(LocalDateTime timestamp) {
        this.createdAt = timestamp;
    }
    
    public LocalDateTime getUpdateTimestamp() {
        return updatedAt;
    }
    
    public void setUpdateTimestamp(LocalDateTime timestamp) {
        this.updatedAt = timestamp;
    }
}
