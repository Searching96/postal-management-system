package org.f3.postalmanagement.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.entity.actor.Customer;
import org.f3.postalmanagement.entity.actor.Employee;
import org.f3.postalmanagement.entity.administrative.AdministrativeRegion;
import org.f3.postalmanagement.entity.administrative.Province;
import org.f3.postalmanagement.entity.administrative.Ward;
import org.f3.postalmanagement.entity.order.Order;
import org.f3.postalmanagement.entity.order.OrderStatusHistory;
import org.f3.postalmanagement.entity.unit.Office;
import org.f3.postalmanagement.entity.unit.OfficePair;
import org.f3.postalmanagement.entity.unit.TransferRoute;
import org.f3.postalmanagement.enums.OfficeType;
import org.f3.postalmanagement.enums.OrderStatus;
import org.f3.postalmanagement.enums.PackageType;
import org.f3.postalmanagement.enums.Role;
import org.f3.postalmanagement.enums.ServiceType;
import org.f3.postalmanagement.repository.AccountRepository;
import org.f3.postalmanagement.repository.AdRegionRepository;
import org.f3.postalmanagement.repository.CustomerRepository;
import org.f3.postalmanagement.repository.EmployeeRepository;
import org.f3.postalmanagement.repository.OfficeRepository;
import org.f3.postalmanagement.repository.OfficePairRepository;
import org.f3.postalmanagement.repository.OrderRepository;
import org.f3.postalmanagement.repository.OrderStatusHistoryRepository;
import org.f3.postalmanagement.repository.ProvinceRepository;
import org.f3.postalmanagement.repository.TransferRouteRepository;
import org.f3.postalmanagement.repository.WardRepository;
import org.f3.postalmanagement.util.PhoneNumberValidator;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final WardRepository wardRepository;
    private final TransferRouteRepository transferRouteRepository;
    private final OfficePairRepository officePairRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        Map<Integer, Office> hubs = initHubForEachRegion();
        initSystemAdmin(hubs.values().stream().findFirst().orElse(null));
        initProvinceOffices(hubs);
        initWardOffices();
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
        } else {
            log.debug("Exist super admin account.");
        }

        // Ensure Employee record exists for admin
        if (!employeeRepository.findByAccount(adminAccount).isPresent()) {
            Employee adminEmployee = new Employee();
            adminEmployee.setAccount(adminAccount);
            adminEmployee.setFullName("Hệ thống (Admin)");
            adminEmployee.setPhoneNumber(PhoneNumberValidator.padToTenDigits("0000000000"));
            // Admin must belong to an office due to DB constraints
            if (defaultOffice != null) {
                adminEmployee.setOffice(defaultOffice);
            } else {
                // Should not happen as hubs are created first, but as safeguard:
                log.warn("Cannot create employee for admin: No default office found.");
                return;
            }
            employeeRepository.save(adminEmployee);
            log.info("Created employee record for super admin assigned to {}", defaultOffice.getOfficeName());
        }
    }

    private Map<Integer, Office> initHubForEachRegion() {
        Map<Integer, Office> hubsByRegion = new HashMap<>();
        
        if (officeRepository.existsByOfficeType(OfficeType.HUB)) {
            log.debug("Hubs already exist.");
            List<Office> existingHubs = officeRepository.findAllByOfficeType(OfficeType.HUB);
            for (Office hub : existingHubs) {
                hubsByRegion.put(hub.getRegion().getId(), hub);
            }
        } else {
            List<AdministrativeRegion> regions = adRegionRepository.findAll();
            
            for (AdministrativeRegion region : regions) {
                Office hub = new Office();
                String officeCode = "HUB-" + String.format("%02d", region.getId());
                
                // Customize for Hanoi (Assumed Region ID or logic) 
                // Since region IDs might vary, we can check region name or known IDs if available.
                // Assuming standard Vietnamese regions: Red River Delta (Hanoi) and Southeast (HCM).
                // Let's use generic names for most, but specific if we can identify.
                // However, the safest way given current context is to map explicitly if IDs are known, 
                // or just use generic for now but update specific ones later.
                
                // User provided specific data for "Hanoi" and "HCM". 
                // Let's try to match by checking if the region contains specific provinces or just names.
                // Simpler approach: Create generic, then update specific ones? No, create correctly first.
                
                String hubName = "HUB " + region.getName();
                String address = "Address HUB " + region.getName();
                
                // Hardcoded adjustment for Demo Realism if Region matches
                // (Note: This relies on assumed region ordering/naming in DB. 
                //  If Region 6 is Southeast (HCM) and Region 2 is Red River Delta (Hanoi))
                if (region.getId() == 2) { // Red River Delta / Hanoi
                     hubName = "Hong Delta Hub (Hà Nội SOC)";
                     address = "Lô 17, 19, 30 - số 386 đường Nguyễn Văn Linh - khu công nghiệp Đài Tư - quận Long Biên - thành phố Hà Nội";
                } else if (region.getId() == 6) { // Southeast / HCM
                     hubName = "Dong Nam Bo Hub (Củ Chi SOC)";
                     address = "Khu công nghiệp Tân Phú Trung, Quốc lộ 22, Ấp Trạm Bơm, xã Tân Phú Trung, huyện Củ Chi, TP. Hồ Chí Minh";
                }

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
                
                // Create HUB_ADMIN for this hub
                createOfficeManager(savedHub, Role.HUB_ADMIN, "hub.admin" + region.getId(), PhoneNumberValidator.padToTenDigits(String.format("09%08d", region.getId())));
                
                log.info("Created HUB for region: {}", region.getName());
            }
            
            log.info("Initialized {} HUBs for all regions.", regions.size());
        }
        
        return hubsByRegion;
    }

    private void initProvinceOffices(Map<Integer, Office> hubsByRegion) {
        // Remove global check to allow filling gaps
        // if (officeRepository.existsByOfficeType(OfficeType.PROVINCE_WAREHOUSE)) { ... }

        List<Province> provinces = provinceRepository.findAll();
        
        for (Province province : provinces) {
            AdministrativeRegion region = province.getAdministrativeRegion();
            Office parentHub = hubsByRegion.get(region.getId());
            
            // Fetch a default ward for this province to associate with the province-level offices
            Ward defaultWard = wardRepository.findByProvince_Code(province.getCode()).stream()
                    .findFirst()
                    .orElse(null);

            // 1. Create PROVINCE_WAREHOUSE if not exists
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
                
                // Create WH_PROVINCE_ADMIN for this warehouse
                createOfficeManager(savedWarehouse, Role.WH_PROVINCE_ADMIN, "wh.admin." + province.getCode(), PhoneNumberValidator.padToTenDigits("091" + province.getCode() + "00"));
                log.info("Created PROVINCE_WAREHOUSE for province: {}", province.getName());
            }

            // 2. Create PROVINCE_POST if not exists
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
                
                // Create PO_PROVINCE_ADMIN for this post office
                createOfficeManager(savedPostOffice, Role.PO_PROVINCE_ADMIN, "po.admin." + province.getCode(), PhoneNumberValidator.padToTenDigits("092" + province.getCode() + "00"));
                log.info("Created PROVINCE_POST for province: {}", province.getName());
            }
        }
        
        log.info("Validated province offices for {} provinces.", provinces.size());
    }

    private void initWardOffices() {
        if (officePairRepository.count() > 0) {
            log.debug("Ward office pairs already exist.");
            return;
        }

        List<Province> provinces = provinceRepository.findAll();
        for (Province province : provinces) {
            String provinceCode = province.getCode();
            
            // Find parent Province Warehouse & Post Office
            String whEmail = "warehouse." + provinceCode + "@f3postal.com";
            Office provinceWh = officeRepository.findByOfficeEmail(whEmail).orElse(null);
            
            String poEmail = "post." + provinceCode + "@f3postal.com";
            Office provincePo = officeRepository.findByOfficeEmail(poEmail).orElse(null);

            if (provinceWh != null && provincePo != null) {
                // Lookup default ward (created in initWards)
                String defaultWardCode = provinceCode + "00001";
                Ward defaultWard = wardRepository.findById(defaultWardCode).orElse(null);

                // Create Ward Warehouse
                Office wardWh = new Office();
                wardWh.setOfficeCode("WH-W1-" + provinceCode);
                wardWh.setOfficeName("Kho Phường 1 " + province.getName());
                wardWh.setOfficeEmail("wh.ward1." + provinceCode + "@f3postal.com");
                wardWh.setOfficePhoneNumber(PhoneNumberValidator.padToTenDigits("09" + province.getCode() + "2000"));
                wardWh.setOfficeAddressLine1("Address Kho Ward 1 " + province.getName());
                wardWh.setRegion(province.getAdministrativeRegion());
                wardWh.setWard(defaultWard);
                wardWh.setParent(provinceWh);
                wardWh.setOfficeType(OfficeType.WARD_WAREHOUSE);
                wardWh.setCapacity(2000);
                // Note: setProvince removed as per new design
                Office savedWardWh = officeRepository.save(wardWh);
                
                // Create Ward Manager for Warehouse
                createOfficeManager(savedWardWh, Role.WH_WARD_MANAGER, "wh.manager.w1." + provinceCode, PhoneNumberValidator.padToTenDigits("093" + province.getCode() + "10"));

                // Create Ward Post Office
                Office wardPo = new Office();
                wardPo.setOfficeCode("PO-W1-" + provinceCode);
                wardPo.setOfficeName("Bưu cục Phường 1 " + province.getName());
                wardPo.setOfficeEmail("po.ward1." + provinceCode + "@f3postal.com");
                wardPo.setOfficePhoneNumber(PhoneNumberValidator.padToTenDigits("09" + province.getCode() + "3000"));
                wardPo.setOfficeAddressLine1("Address PO Ward 1 " + province.getName());
                wardPo.setRegion(province.getAdministrativeRegion());
                wardPo.setWard(defaultWard);
                wardPo.setParent(provincePo);
                wardPo.setOfficeType(OfficeType.WARD_POST);
                // Note: setProvince removed as per new design
                Office savedWardPo = officeRepository.save(wardPo);
                
                // Create Ward Manager for Post Office
                createOfficeManager(savedWardPo, Role.PO_WARD_MANAGER, "po.manager.w1." + provinceCode, PhoneNumberValidator.padToTenDigits("094" + province.getCode() + "10"));

                // Create OfficePair
                OfficePair pair = new OfficePair();
                pair.setWhOffice(savedWardWh);
                pair.setPoOffice(savedWardPo);
                officePairRepository.save(pair);
                
                log.info("Created Ward Office Pair for province: {}", province.getName());
            }
        }
        log.info("Initialized sample Ward Office Pairs for provinces.");
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



    /**
     * Initialize hub-to-hub transfer routes following Vietnam's geography.
     * Creates a connected graph allowing BFS to find alternate routes.
     * * Regional Hub Layout:
     * 1 = Tây Bắc Bộ (Northwest)
     * 2 = Đông Bắc Bộ (Northeast, Hà Nội hub)
     * 3 = Bắc Trung Bộ (North Central)
     * 4 = Nam Trung Bộ (South Central)
     * 5 = Tây Nguyên (Central Highlands)
     * 6 = Đông Nam Bộ (Southeast, HCM hub)
     * 7 = Đồng bằng sông Cửu Long (Mekong Delta)
     * 8 = Đồng bằng sông Hồng (Red River Delta)
     * * Note: If only 6 regions exist, we use IDs 1-6.
     */
    private void initHubTransferRoutes(Map<Integer, Office> hubsByRegion) {
        // Check if routes already exist
        if (transferRouteRepository.count() > 0) {
            log.debug("Transfer routes already exist.");
            return;
        }

        // Primary routes (main corridor) - Priority 1
        // Format: {fromRegionId, toRegionId, distanceKm, transitHours}
        // ONLY creates direct physical links between neighboring regions
        int[][] primaryRoutes = {
            {1, 2, 200, 6},    // Region 1 ↔ Region 2
            {2, 3, 350, 8},    // Region 2 ↔ Region 3
            {3, 4, 400, 10},   // Region 3 ↔ Region 4
            {4, 5, 600, 14},   // Region 4 ↔ Region 5
            {5, 6, 170, 4},    // Region 5 ↔ Region 6
        };
        // Removed Secondary/Express routes to enforce strict "Linked List" chain topology
        // as per user request to avoid "direct connection" confusion.


        int routesCreated = 0;

        // Create bidirectional routes for PRIMARY ONLY
        for (int[] route : primaryRoutes) {
            routesCreated += createBidirectionalRoute(hubsByRegion, route[0], route[1], route[2], route[3], 1);
        }


        log.info("Initialized {} hub-to-hub transfer routes with alternate paths.", routesCreated);
    }

    /**
     * Create bidirectional routes between two hubs.
     * @return Number of routes created (0 or 2)
     */
    private int createBidirectionalRoute(Map<Integer, Office> hubsByRegion, 
                                                                  int regionA, int regionB, 
                                                                  int distanceKm, int transitHours, int priority) {
        Office hubA = hubsByRegion.get(regionA);
        Office hubB = hubsByRegion.get(regionB);

        if (hubA == null || hubB == null) {
            log.warn("Hub not found for regions {} or {}", regionA, regionB);
            return 0;
        }

        // Check if route already exists
        if (transferRouteRepository.existsByFromHubIdAndToHubId(hubA.getId(), hubB.getId())) {
            log.debug("Route {} → {} already exists", hubA.getOfficeName(), hubB.getOfficeName());
            return 0;
        }

        createTransferRoute(hubA, hubB, distanceKm, transitHours, priority);
        createTransferRoute(hubB, hubA, distanceKm, transitHours, priority);

        log.info("Created route (priority {}): {} ↔ {} ({}km, {}hrs)", 
            priority, hubA.getOfficeName(), hubB.getOfficeName(), distanceKm, transitHours);

        return 2;
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