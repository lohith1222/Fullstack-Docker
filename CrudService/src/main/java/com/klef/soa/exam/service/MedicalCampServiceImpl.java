package com.klef.soa.exam.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.klef.soa.exam.entity.MedicalCamp;
import com.klef.soa.exam.repository.MedicalCampRepository;

@Service
public class MedicalCampServiceImpl implements MedicalCampService {

    private final MedicalCampRepository repository;

    public MedicalCampServiceImpl(MedicalCampRepository repository) {
        this.repository = repository;
    }

    @Override
    public MedicalCamp add(MedicalCamp medicalCamp) {
        medicalCamp.setId(null);
        return repository.save(medicalCamp);
    }

    @Override
    public List<MedicalCamp> getAll() {
        return repository.findAll();
    }

    @Override
    public Optional<MedicalCamp> getById(Long id) {
        return repository.findById(id);
    }

    @Override
    public Optional<MedicalCamp> update(Long id, MedicalCamp medicalCamp) {
        return repository.findById(id).map(existingCamp -> {
            existingCamp.setCampName(medicalCamp.getCampName());
            existingCamp.setLocation(medicalCamp.getLocation());
            existingCamp.setCampDate(medicalCamp.getCampDate());
            existingCamp.setDoctorCount(medicalCamp.getDoctorCount());
            return repository.save(existingCamp);
        });
    }

    @Override
    public boolean delete(Long id) {
        if (!repository.existsById(id)) {
            return false;
        }
        repository.deleteById(id);
        return true;
    }
}
