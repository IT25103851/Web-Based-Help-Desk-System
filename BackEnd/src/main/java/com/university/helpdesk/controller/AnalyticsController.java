package com.university.helpdesk.controller;

import com.university.helpdesk.model.AnalyticsComment;
import com.university.helpdesk.model.Role;
import com.university.helpdesk.model.User;
import com.university.helpdesk.repository.AnalyticsCommentRepository;
import com.university.helpdesk.repository.UserRepository;
import com.university.helpdesk.service.AnalyticsService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final AnalyticsCommentRepository analyticsCommentRepository;
    private final UserRepository userRepository;

    public AnalyticsController(AnalyticsService analyticsService,
                               AnalyticsCommentRepository analyticsCommentRepository,
                               UserRepository userRepository) {
        this.analyticsService = analyticsService;
        this.analyticsCommentRepository = analyticsCommentRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('DEPARTMENT_MANAGER', 'ADMIN', 'SYSTEM_ADMINISTRATOR', 'SUPPORT_AGENT')")
    public ResponseEntity<Map<String, Object>> getSummary() {
        return ResponseEntity.ok(analyticsService.getSummary());
    }

    @GetMapping("/agent-performance")
    @PreAuthorize("hasAnyRole('DEPARTMENT_MANAGER', 'ADMIN', 'SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<List<Map<String, Object>>> getAgentPerformance() {
        return ResponseEntity.ok(analyticsService.getAgentPerformance());
    }

    @GetMapping(value = "/export/csv", produces = "text/csv")
    @PreAuthorize("hasAnyRole('DEPARTMENT_MANAGER', 'ADMIN', 'SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<String> exportCsvReport() {
        String csvData = analyticsService.generateCsvReport();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"university_helpdesk_report.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvData);
    }

    // ─── ANALYTICS COMMENTS (CRUD) ──────────────────────────────────────────

    @GetMapping("/comments")
    @PreAuthorize("hasAnyRole('DEPARTMENT_MANAGER', 'ADMIN', 'SYSTEM_ADMINISTRATOR', 'SUPPORT_AGENT')")
    public ResponseEntity<List<AnalyticsComment>> getComments() {
        return ResponseEntity.ok(analyticsCommentRepository.findAllByOrderByCreatedAtDesc());
    }

    @PostMapping("/comments")
    @PreAuthorize("hasAnyRole('DEPARTMENT_MANAGER', 'ADMIN', 'SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<AnalyticsComment> addComment(@RequestBody Map<String, Object> body,
                                                       Authentication auth) {
        String content = body.get("content") != null ? body.get("content").toString() : null;
        if (content == null || content.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "content is required");
        }

        User author = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        AnalyticsComment comment = new AnalyticsComment();
        comment.setAuthor(author);
        comment.setContent(content);

        Object sectionObj = body.get("section");
        if (sectionObj != null && !sectionObj.toString().isBlank()) {
            comment.setSection(sectionObj.toString());
        }

        AnalyticsComment saved = analyticsCommentRepository.save(comment);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/comments/{id}")
    @PreAuthorize("hasAnyRole('DEPARTMENT_MANAGER', 'ADMIN', 'SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<AnalyticsComment> updateComment(@PathVariable Long id,
                                                          @RequestBody Map<String, Object> body,
                                                          Authentication auth) {
        AnalyticsComment comment = analyticsCommentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));

        User currentUser = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        boolean isOwner = comment.getAuthor() != null
                && comment.getAuthor().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ADMIN
                || currentUser.getRole() == Role.SYSTEM_ADMINISTRATOR;

        if (!isOwner && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only edit your own comments");
        }

        String content = body.get("content") != null ? body.get("content").toString() : null;
        if (content == null || content.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "content is required");
        }
        comment.setContent(content);

        AnalyticsComment saved = analyticsCommentRepository.save(comment);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/comments/{id}")
    @PreAuthorize("hasAnyRole('DEPARTMENT_MANAGER', 'ADMIN', 'SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id, Authentication auth) {
        AnalyticsComment comment = analyticsCommentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));

        User currentUser = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        boolean isOwner = comment.getAuthor() != null
                && comment.getAuthor().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ADMIN
                || currentUser.getRole() == Role.SYSTEM_ADMINISTRATOR;

        if (!isOwner && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own comments");
        }

        analyticsCommentRepository.delete(comment);
        return ResponseEntity.noContent().build();
    }
}