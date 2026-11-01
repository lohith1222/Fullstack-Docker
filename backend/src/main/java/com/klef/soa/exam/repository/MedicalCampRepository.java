package com.klef.soa.exam.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.klef.soa.exam.entity.MedicalCamp;

public interface MedicalCampRepository extends JpaRepository<MedicalCamp, Long> {
}
