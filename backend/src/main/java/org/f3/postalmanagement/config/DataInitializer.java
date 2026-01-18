package org.f3.postalmanagement.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.entity.actor.Customer;
import org.f3.postalmanagement.entity.actor.Employee;
import org.f3.postalmanagement.entity.administrative.AdministrativeRegion;
import org.f3.postalmanagement.entity.administrative.Ward;
import org.f3.postalmanagement.entity.order.Order;
import org.f3.postalmanagement.entity.order.OrderStatusHistory;
import org.f3.postalmanagement.entity.administrative.Province;
import org.f3.postalmanagement.entity.unit.Office;
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
import org.f3.postalmanagement.repository.OrderRepository;
import org.f3.postalmanagement.repository.OrderStatusHistoryRepository;
import org.f3.postalmanagement.repository.ProvinceRepository;
import org.f3.postalmanagement.repository.WardRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final WardRepository wardRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        initSystemAdmin();
        Map<Integer, Office> hubs = initHubForEachRegion();
        initProvinceOffices(hubs);
        initTestCustomers();
        initTestOrder();
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
                hub.setCapacity(10000);
                
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
            warehouse.setCapacity(5000);
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

    private void initTestCustomers() {
        // Check if test customer already exists
        if (accountRepository.existsByUsername("0901234567")) {
            log.debug("Test customer already exists.");
            return;
        }

        // Create account first
        Account account = new Account();
        account.setUsername("0901234567");
        account.setPassword(passwordEncoder.encode("123456"));
        account.setRole(Role.CUSTOMER);
        account.setEmail("customer1@gmail.com");
        account.setActive(true);
        Account savedAccount = accountRepository.save(account);

        // Create customer and link to account
        Customer customer = new Customer();
        customer.setAccount(savedAccount);
        customer.setFullName("Nguyễn Văn A");
        customer.setPhoneNumber("0901234567");
        customer.setAddress("123 Đường ABC, Phường XYZ, Quận 1, TP.HCM");
        customerRepository.save(customer);

        log.info("Created test customer: 0901234567 / 123456");
    }

    private void initTestOrder() {
        // Check if test order already exists
        if (orderRepository.existsByTrackingNumber("VNTEST12345VN")) {
            Order existingOrder = orderRepository.findByTrackingNumber("VNTEST12345VN").orElse(null);
            if (existingOrder != null) {
                log.info("Test order already exists with ID: {}", existingOrder.getId());
                log.info("==> Use this Order ID for testing: {}", existingOrder.getId());
            }
            return;
        }

        // Get test customer
        Customer testCustomer = customerRepository.findByPhoneNumber("0901234567")
                .orElseThrow(() -> new IllegalStateException("Test customer not found"));

        // Create receiver customer (walk-in customer without account)
        Customer receiverCustomer = new Customer();
        receiverCustomer.setFullName("Trần Thị B");
        receiverCustomer.setPhoneNumber("0987654321");
        receiverCustomer.setAddress("456 Đường XYZ, Phường ABC, Quận 2, TP.HCM");
        Customer savedReceiver = customerRepository.save(receiverCustomer);

        // Get a ward for sender and receiver
        Ward senderWard = wardRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new IllegalStateException("No ward found in database"));
        Ward receiverWard = wardRepository.findAll().stream().skip(1).findFirst()
                .orElse(senderWard);

        // Get first office as origin
        Office originOffice = officeRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new IllegalStateException("No office found"));

        // Create test order
        Order order = new Order();
        order.setTrackingNumber("VNTEST12345VN");
        
        // Sender info
        order.setSenderCustomer(testCustomer);
        order.setSenderName(testCustomer.getFullName());
        order.setSenderPhone(testCustomer.getPhoneNumber());
        order.setSenderAddress(testCustomer.getAddress());
        
        // Receiver info
        order.setReceiverCustomer(savedReceiver);
        order.setReceiverName(savedReceiver.getFullName());
        order.setReceiverPhone(savedReceiver.getPhoneNumber());
        order.setReceiverAddress(savedReceiver.getAddress());
        order.setDestinationWard(receiverWard);
        
        // Package info
        order.setWeightKg(BigDecimal.valueOf(1.5));
        order.setLengthCm(BigDecimal.valueOf(30));
        order.setWidthCm(BigDecimal.valueOf(20));
        order.setHeightCm(BigDecimal.valueOf(10));
        order.setChargeableWeightKg(BigDecimal.valueOf(1.5));
        order.setPackageType(PackageType.DOCUMENT);
        order.setServiceType(ServiceType.STANDARD);
        
        // Pricing
        order.setShippingFee(BigDecimal.valueOf(50000));
        order.setInsuranceFee(BigDecimal.ZERO);
        order.setCodAmount(BigDecimal.ZERO);
        order.setTotalAmount(BigDecimal.valueOf(50000));
        
        // Status
        order.setStatus(OrderStatus.CREATED);
        order.setOriginOffice(originOffice);
        order.setCurrentOffice(originOffice);
        
        // Need employee to create order - use any existing employee
        Employee anyEmployee = employeeRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new IllegalStateException("No employee found"));
        order.setCreatedByEmployee(anyEmployee);
        
        Order savedOrder = orderRepository.save(order);
        
        // Create status history
        OrderStatusHistory statusHistory = new OrderStatusHistory();
        statusHistory.setOrder(savedOrder);
        statusHistory.setStatus(OrderStatus.CREATED);
        statusHistory.setOffice(originOffice);
        statusHistory.setDescription("Test order created for ABSA testing");
        orderStatusHistoryRepository.save(statusHistory);
        
        log.info("Created test order with tracking number: VNTEST12345VN");
        log.info("============================================");
        log.info("==> TEST ORDER ID: {}", savedOrder.getId());
        log.info("==> Use this Order ID for ABSA testing");
        log.info("============================================");
    }
}
