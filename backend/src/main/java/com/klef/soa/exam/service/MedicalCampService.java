package com.klef.soa.exam.service;

import java.util.List;
import java.util.Optional;

import com.klef.soa.exam.entity.MedicalCamp;

public interface MedicalCampService {

    MedicalCamp add(MedicalCamp medicalCamp);

    List<MedicalCamp> getAll();

    Optional<MedicalCamp> getById(Long id);

    Optional<MedicalCamp> update(Long id, MedicalCamp medicalCamp);

    boolean delete(Long id);
}
