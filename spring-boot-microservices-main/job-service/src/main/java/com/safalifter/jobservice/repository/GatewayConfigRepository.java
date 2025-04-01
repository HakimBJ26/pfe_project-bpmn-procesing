package com.safalifter.jobservice.repository;

import com.safalifter.jobservice.model.BpmnProcess;
import com.safalifter.jobservice.model.GatewayConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GatewayConfigRepository extends JpaRepository<GatewayConfig, Long> {
    
    List<GatewayConfig> findByProcess(BpmnProcess process);
    
    List<GatewayConfig> findByProcessAndGatewayId(BpmnProcess process, String gatewayId);
    
    Optional<GatewayConfig> findByProcessAndGatewayIdAndGatewayName(BpmnProcess process, String gatewayId, String gatewayName);
    
    List<GatewayConfig> findByGatewayType(String gatewayType);
}
