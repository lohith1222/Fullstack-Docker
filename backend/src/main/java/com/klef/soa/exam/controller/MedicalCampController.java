package com.klef.soa.exam.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.klef.soa.exam.entity.MedicalCamp;
import com.klef.soa.exam.service.MedicalCampService;

@RestController
public class MedicalCampController {

    private final MedicalCampService service;

    public MedicalCampController(MedicalCampService service) {
        this.service = service;
    }

    @GetMapping("/")
    public String home() {
        return "CRUD Service is running";
    }

    @PostMapping("/Add")
    public ResponseEntity<MedicalCamp> add(@RequestBody MedicalCamp medicalCamp) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.add(medicalCamp));
    }

    @GetMapping("/DisplayAll")
    public List<MedicalCamp> getAll() {
        return service.getAll();
    }

    @GetMapping("/Display/{id}")
    public ResponseEntity<MedicalCamp> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/Update/{id}")
    public ResponseEntity<MedicalCamp> update(
            @PathVariable Long id,
            @RequestBody MedicalCamp medicalCamp) {
        Optional<MedicalCamp> updatedCamp = service.update(id, medicalCamp);
        return updatedCamp
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/Delete/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        if (!service.delete(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok("Medical camp deleted successfully");
    }
}
