package com.university.helpdesk.repository;

import com.university.helpdesk.model.AnalyticsComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnalyticsCommentRepository extends JpaRepository<AnalyticsComment, Long> {
    List<AnalyticsComment> findAllByOrderByCreatedAtDesc();
}