package com.smartcampus.repository;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.smartcampus.model.Resource;

public interface ResourceRepository extends JpaRepository<Resource, Long>, JpaSpecificationExecutor<Resource> {
    boolean existsByNameIgnoreCaseAndLocationIgnoreCase(String name, String location);

    boolean existsByNameIgnoreCaseAndLocationIgnoreCaseAndIdNot(String name, String location, Long id);

    @Query("SELECT CASE WHEN COUNT(t) > 0 THEN true ELSE false END FROM Ticket t WHERE t.resource.id = :resourceId")
    boolean hasAssociatedTickets(@Param("resourceId") Long resourceId);
}
