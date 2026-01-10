package org.f3.postalmanagement.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.entity.actor.Employee;
import org.f3.postalmanagement.entity.administrative.AdministrativeRegion;
import org.f3.postalmanagement.entity.administrative.Province;
import org.f3.postalmanagement.entity.unit.Office;
import org.f3.postalmanagement.enums.OfficeType;
import org.f3.postalmanagement.enums.Role;
import org.f3.postalmanagement.repository.AccountRepository;
import org.f3.postalmanagement.repository.AdRegionRepository;
import org.f3.postalmanagement.repository.EmployeeRepository;
import org.f3.postalmanagement.repository.OfficeRepository;
import org.f3.postalmanagement.repository.ProvinceRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@Slf4j
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final OfficeRepository officeRepository;
    private final AdRegionRepository adRegionRepository;
    private final ProvinceRepository provinceRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        initSystemAdmin();
        Map<Integer, Office> hubs = initHubForEachRegion();
        initProvinceOffices(hubs);
    }

    private void initSystemAdmin() {
        if (accountRepository.existsByRole(Role.SYSTEM_ADMIN)) {
            log.debug("Exist super admin account.");
        } else {
            Account account = new Account();
            account.setUsername("0000000000");
            account.setPassword(passwordEncoder.encode("123456"));
            account.setRole(Role.SYSTEM_ADMIN);
            account.setEmail("sadmin@f3postal.com");
            account.setActive(true);
            accountRepository.save(account);
            log.info("Created super admin account.");
        }
    }

    private Map<Integer, Office> initHubForEachRegion() {
        Map<Integer, Office> hubsByRegion = new HashMap<>();
        
        if (officeRepository.existsByOfficeType(OfficeType.HUB)) {
            log.debug("Hubs already exist.");
            // Load existing hubs into map
            List<Office> existingHubs = officeRepository.findAllByOfficeType(OfficeType.HUB);
            for (Office hub : existingHubs) {
                hubsByRegion.put(hub.getRegion().getId(), hub);
            }
        } else {
            List<AdministrativeRegion> regions = adRegionRepository.findAll();
            
            for (AdministrativeRegion region : regions) {
                Office hub = new Office();
                hub.setOfficeName("HUB " + region.getName());
                hub.setOfficeEmail("hub" + region.getId() + "@f3postal.com");
                hub.setOfficePhoneNumber("190000000" + region.getId());
                hub.setOfficeAddress("Address HUB " + region.getName());
                hub.setRegion(region);
                hub.setOfficeType(OfficeType.HUB);
                
                Office savedHub = officeRepository.save(hub);
                hubsByRegion.put(region.getId(), savedHub);
                
                // Create HUB_ADMIN for this hub
                createOfficeManager(savedHub, Role.HUB_ADMIN, "hub.admin" + region.getId(), "090000000" + region.getId());
                
                log.info("Created HUB for region: {}", region.getName());
            }
            
            log.info("Initialized {} HUBs for all regions.", regions.size());
        }
        
        return hubsByRegion;
    }

    private void initProvinceOffices(Map<Integer, Office> hubsByRegion) {
        if (officeRepository.existsByOfficeType(OfficeType.PROVINCE_WAREHOUSE)) {
            log.debug("Province offices already exist.");
            return;
        }

        List<Province> provinces = provinceRepository.findAll();
        
        for (Province province : provinces) {
            AdministrativeRegion region = province.getAdministrativeRegion();
            Office parentHub = hubsByRegion.get(region.getId());
            
            // Create PROVINCE_WAREHOUSE
            Office warehouse = new Office();
            warehouse.setOfficeName("Kho " + province.getName());
            warehouse.setOfficeEmail("warehouse." + province.getCode() + "@f3postal.com");
            warehouse.setOfficePhoneNumber("1900" + province.getCode() + "00");
            warehouse.setOfficeAddress("Địa chỉ Kho " + province.getName());
            warehouse.setRegion(region);
            warehouse.setProvince(province);
            warehouse.setParent(parentHub);
            warehouse.setOfficeType(OfficeType.PROVINCE_WAREHOUSE);
            Office savedWarehouse = officeRepository.save(warehouse);
            
            // Create WH_PROVINCE_ADMIN for this warehouse
            createOfficeManager(savedWarehouse, Role.WH_PROVINCE_ADMIN, "wh.admin." + province.getCode(), "091" + province.getCode() + "00000");
            
            // Create PROVINCE_POST
            Office postOffice = new Office();
            postOffice.setOfficeName("Bưu cục " + province.getName());
            postOffice.setOfficeEmail("post." + province.getCode() + "@f3postal.com");
            postOffice.setOfficePhoneNumber("1900" + province.getCode() + "01");
            postOffice.setOfficeAddress("Địa chỉ Bưu cục " + province.getName());
            postOffice.setRegion(region);
            postOffice.setProvince(province);
            postOffice.setParent(parentHub);
            postOffice.setOfficeType(OfficeType.PROVINCE_POST);
            Office savedPostOffice = officeRepository.save(postOffice);
            
            // Create PO_PROVINCE_ADMIN for this post office
            createOfficeManager(savedPostOffice, Role.PO_PROVINCE_ADMIN, "po.admin." + province.getCode(), "092" + province.getCode() + "00000");
            
            log.info("Created PROVINCE_WAREHOUSE and PROVINCE_POST for province: {}", province.getName());
        }
        
        log.info("Initialized province offices for {} provinces.", provinces.size());
    }

    private void createOfficeManager(Office office, Role role, String emailPrefix, String phoneNumber) {
        // Create account
        Account account = new Account();
        account.setUsername(phoneNumber);
        account.setPassword(passwordEncoder.encode("123456"));
        account.setRole(role);
        account.setEmail(emailPrefix + "@f3postal.com");
        account.setActive(true);
        Account savedAccount = accountRepository.save(account);
        
        // Create employee
        Employee employee = new Employee();
        employee.setAccount(savedAccount);
        employee.setFullName("Manager " + office.getOfficeName());
        employee.setPhoneNumber(phoneNumber);
        employee.setOffice(office);
        employeeRepository.save(employee);
        
        log.info("Created {} for office: {}", role, office.getOfficeName());
    }
}
