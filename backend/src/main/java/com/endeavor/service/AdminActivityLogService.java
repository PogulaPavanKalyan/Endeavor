package com.endeavor.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.endeavor.entity.AdminActivityLog;
import com.endeavor.repo.AdminActivityLogRepo;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdminActivityLogService {

    @Autowired
    private AdminActivityLogRepo logRepo;

    public AdminActivityLog logActivity(String username, String action, String details, String ipAddress) {
        AdminActivityLog log = new AdminActivityLog(username, action, details, ipAddress);
        return logRepo.save(log);
    }

    public List<AdminActivityLog> getAllLogs() {
        return logRepo.findAll();
    }
}
