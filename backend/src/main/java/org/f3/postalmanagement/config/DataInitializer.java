package org.f3.postalmanagement.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.entity.actor.Employee;
import org.f3.postalmanagement.entity.administrative.AdministrativeRegion;
import org.f3.postalmanagement.entity.administrative.Province;
import org.f3.postalmanagement.entity.administrative.Ward;
import org.f3.postalmanagement.entity.unit.Office;
import org.f3.postalmanagement.entity.unit.OfficePair;
import org.f3.postalmanagement.entity.unit.TransferRoute;
import org.f3.postalmanagement.entity.unit.WardOfficeAssignment;
import org.f3.postalmanagement.enums.OfficeType;
import org.f3.postalmanagement.enums.Role;
import org.f3.postalmanagement.repository.*;
import org.f3.postalmanagement.util.PhoneNumberValidator;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
@org.springframework.core.annotation.Order(1)
@Slf4j
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final OfficeRepository officeRepository;
    private final AdRegionRepository adRegionRepository;
    private final ProvinceRepository provinceRepository;
    private final EmployeeRepository employeeRepository;
    private final WardRepository wardRepository;
    private final TransferRouteRepository transferRouteRepository;
    private final OfficePairRepository officePairRepository;
    private final WardOfficeAssignmentRepository wardOfficeAssignmentRepository;

    // List of Wards reserved for the LogisticsDemoSeeder
    private static final List<String> DEMO_WARDS = Arrays.asList("Thịnh Quang", "Linh Xuân");

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        Map<Integer, Office> hubs = initHubForEachRegion();
        initSystemAdmin(hubs.values().stream().findFirst().orElse(null));
        initProvinceOffices(hubs);
        initHubTransferRoutes(hubs);
    }

    private void initSystemAdmin(Office defaultOffice) {
        Account adminAccount = accountRepository.findByUsername("0000000000").orElse(null);
        if (adminAccount == null) {
            adminAccount = new Account();
            adminAccount.setUsername("0000000000");
            adminAccount.setPassword(passwordEncoder.encode("123456"));
            adminAccount.setRole(Role.SYSTEM_ADMIN);
            adminAccount.setEmail("sadmin@f3postal.com");
            adminAccount.setActive(true);
            adminAccount = accountRepository.save(adminAccount);
            log.info("Created super admin account.");
        }
        if (!employeeRepository.findByAccount(adminAccount).isPresent()) {
            Employee adminEmployee = new Employee();
            adminEmployee.setAccount(adminAccount);
            adminEmployee.setFullName("Hệ thống (Admin)");
            adminEmployee.setPhoneNumber(PhoneNumberValidator.padToTenDigits("0000000000"));
            if (defaultOffice != null) {
                adminEmployee.setOffice(defaultOffice);
            } else {
                return;
            }
            employeeRepository.save(adminEmployee);
        }
    }

    private Map<Integer, Office> initHubForEachRegion() {
        Map<Integer, Office> hubsByRegion = new HashMap<>();
        if (officeRepository.existsByOfficeType(OfficeType.HUB)) {
            List<Office> existingHubs = officeRepository.findAllByOfficeType(OfficeType.HUB);
            for (Office hub : existingHubs) {
                hubsByRegion.put(hub.getRegion().getId(), hub);
            }
        } else {
            List<AdministrativeRegion> regions = adRegionRepository.findAll();
            for (AdministrativeRegion region : regions) {
                Office hub = new Office();
                String officeCode = "HUB-" + String.format("%02d", region.getId());
                String hubName = "HUB " + region.getName();
                String address = "Address HUB " + region.getName();

                if (region.getId() == 2) {
                    hubName = "Hong Delta Hub (Hà Nội SOC)";
                    address = "Lô 17, 19, 30 - số 386 đường Nguyễn Văn Linh...";
                } else if (region.getId() == 6) {
                    hubName = "Dong Nam Bo Hub (Củ Chi SOC)";
                    address = "Khu công nghiệp Tân Phú Trung...";
                }

                // Ward assignment logic
                Province firstProvinceInRegion = provinceRepository.findAll().stream()
                        .filter(p -> p.getAdministrativeRegion().getId().equals(region.getId()))
                        .findFirst().orElse(null);
                Ward defaultWard = null;
                if (firstProvinceInRegion != null) {
                    defaultWard = wardRepository.findByProvince_Code(firstProvinceInRegion.getCode())
                            .stream().findFirst().orElse(null);
                }
                if (defaultWard != null) hub.setWard(defaultWard);

                hub.setOfficeCode(officeCode);
                hub.setOfficeName(hubName);
                hub.setOfficeEmail("hub" + region.getId() + "@f3postal.com");
                hub.setOfficePhoneNumber(PhoneNumberValidator.padToTenDigits("09" + String.format("%08d", region.getId())));
                hub.setOfficeAddressLine1(address);
                hub.setRegion(region);
                hub.setOfficeType(OfficeType.HUB);
                hub.setCapacity(10000);

                Office savedHub = officeRepository.save(hub);
                hubsByRegion.put(region.getId(), savedHub);
                createOfficeManager(savedHub, Role.HUB_ADMIN, "hub.admin" + region.getId(), PhoneNumberValidator.padToTenDigits(String.format("09%08d", region.getId())));
            }
        }
        return hubsByRegion;
    }

    private void initProvinceOffices(Map<Integer, Office> hubsByRegion) {
        List<Province> provinces = provinceRepository.findAll();
        for (Province province : provinces) {
            AdministrativeRegion region = province.getAdministrativeRegion();
            Office parentHub = hubsByRegion.get(region.getId());
            Ward defaultWard = wardRepository.findByProvince_Code(province.getCode()).stream().findFirst().orElse(null);

            String warehouseEmail = "warehouse." + province.getCode() + "@f3postal.com";
            if (!officeRepository.existsByOfficeEmail(warehouseEmail)) {
                Office warehouse = new Office();
                warehouse.setOfficeCode("WH-" + province.getCode());
                warehouse.setOfficeName("Kho " + province.getName());
                warehouse.setOfficeEmail(warehouseEmail);
                warehouse.setOfficePhoneNumber(PhoneNumberValidator.padToTenDigits("09" + province.getCode() + "0000"));
                warehouse.setOfficeAddressLine1("Địa chỉ Kho " + province.getName());
                warehouse.setRegion(region);
                warehouse.setWard(defaultWard);
                warehouse.setParent(parentHub);
                warehouse.setOfficeType(OfficeType.PROVINCE_WAREHOUSE);
                warehouse.setCapacity(5000);
                Office savedWarehouse = officeRepository.save(warehouse);
                createOfficeManager(savedWarehouse, Role.WH_PROVINCE_ADMIN, "wh.admin." + province.getCode(), PhoneNumberValidator.padToTenDigits("091" + province.getCode() + "00"));
            }

            String postOfficeEmail = "post." + province.getCode() + "@f3postal.com";
            if (!officeRepository.existsByOfficeEmail(postOfficeEmail)) {
                Office postOffice = new Office();
                postOffice.setOfficeCode("PO-" + province.getCode());
                postOffice.setOfficeName("Bưu cục " + province.getName());
                postOffice.setOfficeEmail(postOfficeEmail);
                postOffice.setOfficePhoneNumber(PhoneNumberValidator.padToTenDigits("09" + province.getCode() + "1000"));
                postOffice.setOfficeAddressLine1("Địa chỉ Bưu cục " + province.getName());
                postOffice.setRegion(region);
                postOffice.setWard(defaultWard);
                postOffice.setParent(parentHub);
                postOffice.setOfficeType(OfficeType.PROVINCE_POST);
                Office savedPostOffice = officeRepository.save(postOffice);
                createOfficeManager(savedPostOffice, Role.PO_PROVINCE_ADMIN, "po.admin." + province.getCode(), PhoneNumberValidator.padToTenDigits("092" + province.getCode() + "00"));
            }
        }
    }

    private void createOfficeManager(Office office, Role role, String emailPrefix, String phoneNumber) {
        if (accountRepository.existsByUsername(phoneNumber)) return;
        Account account = new Account();
        account.setUsername(phoneNumber);
        account.setPassword(passwordEncoder.encode("123456"));
        account.setRole(role);
        account.setEmail(emailPrefix + "@f3postal.com");
        account.setActive(true);
        Account savedAccount = accountRepository.save(account);
        
        Employee employee = new Employee();
        employee.setAccount(savedAccount);
        employee.setFullName("Manager " + office.getOfficeName());
        employee.setPhoneNumber(phoneNumber);
        employee.setOffice(office);
        employeeRepository.save(employee);
    }

    private void initHubTransferRoutes(Map<Integer, Office> hubsByRegion) {
        if (transferRouteRepository.count() > 0) return;
        int[][] primaryRoutes = {
            {1, 2, 200, 6}, {2, 3, 350, 8}, {3, 4, 400, 10}, {4, 5, 600, 14}, {5, 6, 170, 4}
        };
        for (int[] route : primaryRoutes) {
            createBidirectionalRoute(hubsByRegion, route[0], route[1], route[2], route[3], 1);
        }
    }

    private void createBidirectionalRoute(Map<Integer, Office> hubsByRegion, int regionA, int regionB, int distanceKm, int transitHours, int priority) {
        Office hubA = hubsByRegion.get(regionA);
        Office hubB = hubsByRegion.get(regionB);
        if (hubA == null || hubB == null || transferRouteRepository.existsByFromHubIdAndToHubId(hubA.getId(), hubB.getId())) return;
        createTransferRoute(hubA, hubB, distanceKm, transitHours, priority);
        createTransferRoute(hubB, hubA, distanceKm, transitHours, priority);
    }

    private void createTransferRoute(Office fromHub, Office toHub, int distanceKm, int transitHours, int priority) {
        TransferRoute route = new TransferRoute();
        route.setFromHub(fromHub);
        route.setToHub(toHub);
        route.setDistanceKm(distanceKm);
        route.setTransitHours(transitHours);
        route.setPriority(priority);
        route.setIsActive(true);
        transferRouteRepository.save(route);
    }
}