package org.f3.postalmanagement.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.entity.actor.Customer;
import org.f3.postalmanagement.entity.actor.Employee;
import org.f3.postalmanagement.entity.administrative.Province;
import org.f3.postalmanagement.entity.administrative.Ward;
import org.f3.postalmanagement.entity.order.Order;
import org.f3.postalmanagement.entity.order.OrderStatusHistory;
import org.f3.postalmanagement.entity.unit.Office;
import org.f3.postalmanagement.enums.*;
import org.f3.postalmanagement.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Component
@org.springframework.core.annotation.Order(3) // Runs LAST
@RequiredArgsConstructor
@Slf4j
public class LogisticsDemoSeeder implements CommandLineRunner {

    private final OfficeRepository officeRepository;
    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final WardRepository wardRepository;
    private final ProvinceRepository provinceRepository;
    private final EmployeeRepository employeeRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    
    // NEW DEPENDENCIES
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("=== Starting Logistics Demo Scenario Seeding ===");

        Ward hanoiWard = ensureWard("01", "Thịnh Quang");
        Ward hcmWard = ensureWard("79", "Linh Xuân");
        
        if (hanoiWard == null || hcmWard == null) {
            log.error("Missing Ward data. Skipping demo.");
            return;
        }

        Office hanoiHub = ensureHub("01", "Hong Delta Hub (Hà Nội SOC)", 
                "Lô 17, 19, 30 - số 386 đường Nguyễn Văn Linh");
        
        Office hcmHub = ensureHub("79", "Dong Nam Bo Hub (Củ Chi SOC)", 
                "KCN Tân Phú Trung, Quốc lộ 22, Củ Chi");

        Office hanoiProvinceWH = getProvinceWarehouse("01");
        Office hcmProvinceWH = getProvinceWarehouse("79");

        Office hanoiPost = ensurePostOffice("SPX Hà Nội - Đống Đa 5", 
                "530 Láng, P. Láng Hạ", hanoiWard, hanoiProvinceWH);
        
        Office hcmPost = ensurePostOffice("SPX TP.HCM - Thủ Đức", 
                "86 Quốc lộ 1K", hcmWard, hcmProvinceWH);

        // === 1. CREATE STAFF FOR HANOI HUB (Phone-based login) ===
        Employee hubStaff = ensureStaff(
            "0991112222",            // Username (Phone Number)
            "123456",                // Password
            "staff.hub.hn@f3.com",   // Email
            "0991112222",            // Phone
            "Nguyễn Văn Hub",        // Full Name
            hanoiHub                 // Office
        );

        // === 2. CREATE STAFF FOR HANOI POST OFFICE (Phone-based login) ===
        Employee postStaff = ensureStaff(
            "0993334444",            // Username (Phone Number)
            "123456",                // Password
            "staff.post.hn@f3.com",  // Email
            "0993334444",            // Phone
            "Trần Thị Post",         // Full Name
            hanoiPost                // Office
        );

        // === 3. CREATE SHIPPER FOR HCM POST OFFICE (Phone-based login) ===
        Employee hcmShipper = ensureShipper(
            "0940100001",            // Username (Phone Number)
            "123456",                // Password
            "shipper.hcm@f3.com",    // Email
            "0940100001",            // Phone
            "Shipper Thủ Đức 1",     // Full Name
            hcmPost                  // Office
        );

        // === 4. CREATE CUSTOMER ACCOUNT FOR PHÙNG THANH ĐỘ (Phone-based login) ===
        Customer sender = ensureCustomerWithAccount("Phùng Thanh Độ", "0912345678", "120 P.Yên Lãng", hanoiWard);

        // Receivers (no login accounts needed)
        Customer receiver1 = ensureCustomer("Trường ĐH CNTT", "02837252002", "Khu phố 34", hcmWard);
        Customer receiver2 = ensureCustomer("Nguyễn Văn A", "0988888888", "Hạ Long", hanoiWard);
        Customer receiver3 = ensureCustomer("Trần Thị B", "0977777777", "Láng Hạ", hanoiWard);

        // Use the new staff as creator if available
        Employee defaultCreator = (hubStaff != null) ? hubStaff : employeeRepository.findAll().stream().findFirst().orElse(null);

        // CREATE DEMO ORDERS - All from "Phùng Thanh Độ" to demonstrate different stages
        log.info("Creating multiple demo orders for Phùng Thanh Độ...");

        // 1. Order just created
        createOrderInStage(sender, receiver1, hanoiPost, hcmPost, OrderStatus.CREATED,
                "DEMO-PTD-01", defaultCreator, "Đơn hàng mới tạo");

        // 2. Order pending pickup
        createOrderInStage(sender, receiver2, hanoiPost, hcmPost, OrderStatus.PENDING_PICKUP,
                "DEMO-PTD-02", defaultCreator, "Chờ lấy hàng");

        // 3. Order at origin office
        createOrderInStage(sender, receiver3, hanoiPost, hcmPost, OrderStatus.AT_ORIGIN_OFFICE,
                "DEMO-PTD-03", defaultCreator, "Tại bưu cục gốc");

        // 4. Order in transit to hub
        createOrderInStage(sender, receiver1, hanoiPost, hcmPost, OrderStatus.IN_TRANSIT_TO_HUB,
                "DEMO-PTD-04", defaultCreator, "Đang vận chuyển tới hub");

        // 5. Order at hub
        createOrderInStage(sender, receiver2, hanoiPost, hcmPost, OrderStatus.AT_HUB,
                "DEMO-PTD-05", defaultCreator, "Tại hub khu vực", hanoiHub);

        // 6. Order in transit to destination
        createOrderInStage(sender, receiver3, hanoiPost, hcmPost, OrderStatus.IN_TRANSIT_TO_DESTINATION,
                "DEMO-PTD-06", defaultCreator, "Đang vận chuyển tới điểm đến");

        // 7. Order at destination hub
        createOrderInStage(sender, receiver1, hanoiPost, hcmPost, OrderStatus.AT_DESTINATION_HUB,
                "DEMO-PTD-07", defaultCreator, "Tại hub đích", hcmHub);

        // 8. Order out for delivery
        createOrderInStage(sender, receiver2, hanoiPost, hcmPost, OrderStatus.OUT_FOR_DELIVERY,
                "DEMO-PTD-08", defaultCreator, "Đang giao hàng", hcmPost, hcmShipper);

        // 9. Order delivered successfully
        createOrderInStage(sender, receiver3, hanoiPost, hcmPost, OrderStatus.DELIVERED,
                "DEMO-PTD-09", defaultCreator, "Đã giao thành công", null, hcmShipper);

        // 10. Order delivery failed
        createOrderInStage(sender, receiver1, hanoiPost, hcmPost, OrderStatus.DELIVERY_FAILED,
                "DEMO-PTD-10", defaultCreator, "Giao hàng thất bại", null, hcmShipper);

        // 11. Order returning
        createOrderInStage(sender, receiver2, hanoiPost, hcmPost, OrderStatus.RETURNING,
                "DEMO-PTD-11", defaultCreator, "Đang hoàn trả");

        // 12. Order on hold
        createOrderInStage(sender, receiver3, hanoiPost, hcmPost, OrderStatus.ON_HOLD,
                "DEMO-PTD-12", defaultCreator, "Tạm giữ");

        log.info("Created 12 demo orders for Phùng Thanh Độ showing all lifecycle stages");

        log.info("=== Logistics Demo Scenarios Created Successfully ===");
    }

    // === HELPER TO CREATE STAFF ACCOUNT + EMPLOYEE ===
    private Employee ensureStaff(String username, String rawPass, String email, String phone, String fullName, Office office) {
        Optional<Account> existingAccount = accountRepository.findByUsername(username);
        if (existingAccount.isPresent()) {
            return employeeRepository.findByAccount(existingAccount.get()).orElse(null);
        }

        // 1. Create Account
        Account account = new Account();
        account.setUsername(username);
        account.setPassword(passwordEncoder.encode(rawPass));
        account.setEmail(email);
        account.setRole(Role.WH_STAFF); // Role for internal staff
        account.setActive(true);
        Account savedAccount = accountRepository.save(account);

        // 2. Create Employee (Linked via @MapsId)
        Employee employee = new Employee();
        employee.setAccount(savedAccount);
        employee.setFullName(fullName);
        employee.setPhoneNumber(phone);
        employee.setOffice(office);

        log.info("Created Staff: {} at Office: {}", username, office.getOfficeName());
        return employeeRepository.save(employee);
    }

    // === HELPER TO CREATE SHIPPER ACCOUNT + EMPLOYEE ===
    private Employee ensureShipper(String username, String rawPass, String email, String phone, String fullName, Office office) {
        Optional<Account> existingAccount = accountRepository.findByUsername(username);
        if (existingAccount.isPresent()) {
            return employeeRepository.findByAccount(existingAccount.get()).orElse(null);
        }

        // 1. Create Account
        Account account = new Account();
        account.setUsername(username);
        account.setPassword(passwordEncoder.encode(rawPass));
        account.setEmail(email);
        account.setRole(Role.SHIPPER); // Shipper role
        account.setActive(true);
        Account savedAccount = accountRepository.save(account);

        // 2. Create Employee (Linked via @MapsId)
        Employee employee = new Employee();
        employee.setAccount(savedAccount);
        employee.setFullName(fullName);
        employee.setPhoneNumber(phone);
        employee.setOffice(office);

        log.info("Created Shipper: {} at Office: {}", username, office.getOfficeName());
        return employeeRepository.save(employee);
    }

    /**
     * Helper method to create an order at a specific stage
     */
    private void createOrderInStage(Customer sender, Customer receiver,
                                    Office originPost, Office destPost,
                                    OrderStatus targetStatus, String trackingNum,
                                    Employee creator, String description) {
        createOrderInStage(sender, receiver, originPost, destPost, targetStatus,
                          trackingNum, creator, description, null, null);
    }

    private void createOrderInStage(Customer sender, Customer receiver,
                                    Office originPost, Office destPost,
                                    OrderStatus targetStatus, String trackingNum,
                                    Employee creator, String description, Office currentOffice) {
        createOrderInStage(sender, receiver, originPost, destPost, targetStatus,
                          trackingNum, creator, description, currentOffice, null);
    }

    private void createOrderInStage(Customer sender, Customer receiver,
                                    Office originPost, Office destPost,
                                    OrderStatus targetStatus, String trackingNum,
                                    Employee creator, String description, Office currentOffice, Employee assignedShipper) {
        if (orderRepository.existsByTrackingNumber(trackingNum)) return;

        Order order = new Order();
        order.setTrackingNumber(trackingNum);
        order.setSenderCustomer(sender);
        order.setSenderName(sender.getFullName());
        order.setSenderPhone(sender.getPhoneNumber());
        order.setSenderAddressLine1(sender.getAddressLine1());
        order.setSenderWard(sender.getWard());

        order.setReceiverCustomer(receiver);
        order.setReceiverName(receiver.getFullName());
        order.setReceiverPhone(receiver.getPhoneNumber());
        order.setReceiverAddressLine1(receiver.getAddressLine1());
        order.setReceiverWard(receiver.getWard());

        order.setOriginOffice(originPost);
        order.setDestinationOffice(destPost);
        order.setCreatedByEmployee(creator);

        order.setPackageType(PackageType.BOX);
        order.setServiceType(ServiceType.STANDARD);
        order.setWeightKg(BigDecimal.valueOf(1.5));
        order.setChargeableWeightKg(BigDecimal.valueOf(1.5));
        order.setShippingFee(BigDecimal.valueOf(35000));
        order.setTotalAmount(BigDecimal.valueOf(35000));
        order.setCodAmount(BigDecimal.ZERO);
        order.setInsuranceFee(BigDecimal.ZERO);

        order.setStatus(targetStatus);
        order.setCurrentOffice(currentOffice != null ? currentOffice : originPost);
        order.setInternalNotes("DEMO: " + description);

        // Assign shipper for delivery-related orders
        if (assignedShipper != null) {
            order.setAssignedShipper(assignedShipper);
        }

        Order savedOrder = orderRepository.save(order);

        // Create basic status history based on target status
        LocalDateTime now = LocalDateTime.now();
        createHistory(savedOrder, OrderStatus.CREATED, originPost,
                     now.minusHours(getHoursForStatus(targetStatus)), "Đơn hàng được tạo");

        // Add intermediate statuses if needed
        if (targetStatus != OrderStatus.CREATED) {
            addIntermediateHistory(savedOrder, targetStatus, originPost, destPost, now);
        }

        log.info("Created demo order {} at status {}", trackingNum, targetStatus);
    }

    /**
     * Add intermediate status history entries based on the target status
     */
    private void addIntermediateHistory(Order order, OrderStatus targetStatus,
                                       Office originPost, Office destPost,
                                       LocalDateTime endTime) {
        Office currentOffice = originPost;
        int hourOffset = getHoursForStatus(targetStatus);

        switch (targetStatus) {
            case DELIVERED:
                createHistory(order, OrderStatus.OUT_FOR_DELIVERY, destPost,
                             endTime.minusHours(1), "Đang giao hàng");
                // Fall through
            case OUT_FOR_DELIVERY:
                createHistory(order, OrderStatus.AT_DESTINATION_OFFICE, destPost,
                             endTime.minusHours(2), "Tại bưu cục đích");
                // Fall through
            case AT_DESTINATION_OFFICE:
                createHistory(order, OrderStatus.IN_TRANSIT_TO_OFFICE, destPost,
                             endTime.minusHours(3), "Đang vận chuyển tới bưu cục");
                // Fall through
            case IN_TRANSIT_TO_OFFICE:
            case AT_DESTINATION_HUB:
                createHistory(order, OrderStatus.AT_DESTINATION_HUB, destPost,
                             endTime.minusHours(5), "Tại hub đích");
                // Fall through
            case IN_TRANSIT_TO_DESTINATION:
                createHistory(order, OrderStatus.IN_TRANSIT_TO_DESTINATION, originPost,
                             endTime.minusHours(10), "Đang vận chuyển liên tỉnh");
                // Fall through
            case AT_HUB:
                createHistory(order, OrderStatus.AT_HUB, originPost,
                             endTime.minusHours(12), "Tại hub gốc");
                // Fall through
            case IN_TRANSIT_TO_HUB:
                createHistory(order, OrderStatus.IN_TRANSIT_TO_HUB, originPost,
                             endTime.minusHours(14), "Đang vận chuyển tới hub");
                // Fall through
            case SORTED_AT_ORIGIN:
                createHistory(order, OrderStatus.SORTED_AT_ORIGIN, originPost,
                             endTime.minusHours(15), "Đã phân loại");
                // Fall through
            case AT_ORIGIN_OFFICE:
                createHistory(order, OrderStatus.AT_ORIGIN_OFFICE, originPost,
                             endTime.minusHours(16), "Tại bưu cục gốc");
                // Fall through
            case PICKED_UP:
                createHistory(order, OrderStatus.PICKED_UP, originPost,
                             endTime.minusHours(17), "Đã lấy hàng");
                // Fall through
            case PENDING_PICKUP:
                createHistory(order, OrderStatus.PENDING_PICKUP, originPost,
                             endTime.minusHours(18), "Chờ lấy hàng");
                break;

            case DELIVERY_FAILED:
                createHistory(order, OrderStatus.OUT_FOR_DELIVERY, destPost,
                             endTime.minusHours(1), "Đang giao hàng");
                createHistory(order, OrderStatus.AT_DESTINATION_OFFICE, destPost,
                             endTime.minusHours(3), "Tại bưu cục đích");
                break;

            case RETURNING:
                createHistory(order, OrderStatus.DELIVERY_FAILED, destPost,
                             endTime.minusHours(2), "Giao hàng thất bại");
                createHistory(order, OrderStatus.OUT_FOR_DELIVERY, destPost,
                             endTime.minusHours(4), "Đang giao hàng");
                break;

            case ON_HOLD:
                createHistory(order, OrderStatus.AT_ORIGIN_OFFICE, originPost,
                             endTime.minusHours(2), "Tại bưu cục gốc");
                break;

            default:
                break;
        }

        // Add the final status
        createHistory(order, targetStatus,
                     order.getCurrentOffice(), endTime, order.getInternalNotes());
    }

    /**
     * Get relative hours based on status (for time simulation)
     */
    private int getHoursForStatus(OrderStatus status) {
        switch (status) {
            case CREATED: return 24;
            case PENDING_PICKUP: return 20;
            case PICKED_UP: return 18;
            case AT_ORIGIN_OFFICE: return 16;
            case SORTED_AT_ORIGIN: return 15;
            case IN_TRANSIT_TO_HUB: return 14;
            case AT_HUB: return 12;
            case IN_TRANSIT_TO_DESTINATION: return 10;
            case AT_DESTINATION_HUB: return 5;
            case IN_TRANSIT_TO_OFFICE: return 3;
            case AT_DESTINATION_OFFICE: return 2;
            case OUT_FOR_DELIVERY: return 1;
            case DELIVERED: return 0;
            case DELIVERY_FAILED: return 1;
            case RETURNING: return 2;
            case ON_HOLD: return 4;
            default: return 24;
        }
    }

    private void createInterRegionDemoOrder(Customer sender, Customer receiver, 
                                            Office originPost, Office destPost, 
                                            Office hubOrigin, Office hubDest, 
                                            Office provinceOrigin, Office provinceDest,
                                            Employee creator) {
        String trackingNum = "DEMO-HN-HCM-01"; 
        if (orderRepository.existsByTrackingNumber(trackingNum)) return;

        Order order = new Order();
        order.setTrackingNumber(trackingNum);
        order.setSenderCustomer(sender);
        order.setSenderName(sender.getFullName());
        order.setSenderPhone(sender.getPhoneNumber());
        order.setSenderAddressLine1(sender.getAddressLine1());
        order.setSenderWard(sender.getWard());

        order.setReceiverCustomer(receiver);
        order.setReceiverName(receiver.getFullName());
        order.setReceiverPhone(receiver.getPhoneNumber());
        order.setReceiverAddressLine1(receiver.getAddressLine1());
        order.setReceiverWard(receiver.getWard());
        order.setInternalNotes("DEMO:INTER_REGION"); 

        order.setOriginOffice(originPost);
        order.setDestinationOffice(destPost);
        order.setCreatedByEmployee(creator);
        
        order.setPackageType(PackageType.BOX);
        order.setServiceType(ServiceType.STANDARD);
        order.setWeightKg(BigDecimal.valueOf(2.5));
        order.setChargeableWeightKg(BigDecimal.valueOf(2.5));
        order.setShippingFee(BigDecimal.valueOf(45000));
        order.setTotalAmount(BigDecimal.valueOf(45000));
        order.setCodAmount(BigDecimal.ZERO);
        order.setInsuranceFee(BigDecimal.ZERO);
        
        order.setStatus(OrderStatus.OUT_FOR_DELIVERY);
        order.setCurrentOffice(destPost);

        Order savedOrder = orderRepository.save(order);
        
        LocalDateTime t = LocalDateTime.now().minusHours(48);
        createHistory(savedOrder, OrderStatus.CREATED, originPost, t, "Created");
        createHistory(savedOrder, OrderStatus.AT_ORIGIN_OFFICE, originPost, t.plusMinutes(30), "At Origin");
        createHistory(savedOrder, OrderStatus.IN_TRANSIT_TO_OFFICE, originPost, t.plusHours(2), "To Province WH");
        createHistory(savedOrder, OrderStatus.AT_ORIGIN_OFFICE, provinceOrigin, t.plusHours(3), "At Province WH");
        createHistory(savedOrder, OrderStatus.IN_TRANSIT_TO_HUB, provinceOrigin, t.plusHours(4), "To Hub");
        createHistory(savedOrder, OrderStatus.AT_HUB, hubOrigin, t.plusHours(5), "At Origin Hub");
        createHistory(savedOrder, OrderStatus.IN_TRANSIT_TO_DESTINATION, hubOrigin, t.plusHours(10), "To Dest Hub");
        createHistory(savedOrder, OrderStatus.AT_DESTINATION_HUB, hubDest, t.plusHours(36), "At Dest Hub");
        createHistory(savedOrder, OrderStatus.IN_TRANSIT_TO_OFFICE, hubDest, t.plusHours(38), "To Province WH");
        createHistory(savedOrder, OrderStatus.AT_DESTINATION_OFFICE, provinceDest, t.plusHours(39), "At Dest Province WH");
        createHistory(savedOrder, OrderStatus.IN_TRANSIT_TO_OFFICE, provinceDest, t.plusHours(40), "To Post Office");
        createHistory(savedOrder, OrderStatus.AT_DESTINATION_OFFICE, destPost, t.plusHours(41), "At Dest Post");
        createHistory(savedOrder, OrderStatus.OUT_FOR_DELIVERY, destPost, LocalDateTime.now().minusMinutes(15), "Out for delivery");
    }

    private void createInterProvinceDemoOrder(Customer sender, Office origin, Office hub, Employee creator) {
        String trackingNum = "DEMO-PROV-02";
        if (orderRepository.existsByTrackingNumber(trackingNum)) return;
        
        Order order = new Order();
        order.setTrackingNumber(trackingNum);
        order.setSenderCustomer(sender);
        order.setSenderName(sender.getFullName());
        order.setSenderPhone(sender.getPhoneNumber());
        order.setSenderAddressLine1(sender.getAddressLine1());
        order.setSenderWard(sender.getWard());
        
        order.setReceiverCustomer(sender); 
        order.setReceiverName("Khách Quảng Ninh");
        order.setReceiverPhone("0988888888");
        order.setReceiverAddressLine1("Hạ Long");
        order.setInternalNotes("DEMO:INTER_PROVINCE");
        
        order.setOriginOffice(origin);
        order.setCreatedByEmployee(creator);
        
        order.setPackageType(PackageType.DOCUMENT);
        order.setServiceType(ServiceType.STANDARD);
        order.setWeightKg(BigDecimal.valueOf(0.5));
        order.setChargeableWeightKg(BigDecimal.valueOf(0.5));
        order.setShippingFee(BigDecimal.valueOf(30000));
        order.setTotalAmount(BigDecimal.valueOf(30000));
        order.setCodAmount(BigDecimal.ZERO);
        order.setInsuranceFee(BigDecimal.ZERO);

        order.setStatus(OrderStatus.IN_TRANSIT_TO_HUB);
        order.setCurrentOffice(origin.getParent());
        
        Order saved = orderRepository.save(order);
        createHistory(saved, OrderStatus.CREATED, origin, LocalDateTime.now().minusHours(5), "Created");
    }

    private void createInterWardDemoOrder(Customer sender, Office origin, Employee creator) {
        String trackingNum = "DEMO-WARD-03";
        if (orderRepository.existsByTrackingNumber(trackingNum)) return;

        Order order = new Order();
        order.setTrackingNumber(trackingNum);
        order.setSenderCustomer(sender);
        order.setSenderName(sender.getFullName());
        order.setSenderPhone(sender.getPhoneNumber());
        order.setSenderAddressLine1(sender.getAddressLine1());
        order.setSenderWard(sender.getWard());
        
        order.setReceiverCustomer(sender);
        order.setReceiverName("Khách Đống Đa");
        order.setReceiverPhone("0977777777");
        order.setReceiverAddressLine1("Láng Hạ");
        order.setInternalNotes("DEMO:INTER_WARD");

        order.setOriginOffice(origin);
        order.setDestinationOffice(origin);
        order.setCreatedByEmployee(creator);
        
        order.setPackageType(PackageType.BOX);
        order.setServiceType(ServiceType.EXPRESS);
        order.setWeightKg(BigDecimal.valueOf(1.0));
        order.setChargeableWeightKg(BigDecimal.valueOf(1.0));
        order.setShippingFee(BigDecimal.valueOf(16000));
        order.setTotalAmount(BigDecimal.valueOf(16000));
        order.setCodAmount(BigDecimal.ZERO);
        order.setInsuranceFee(BigDecimal.ZERO);

        order.setStatus(OrderStatus.AT_ORIGIN_OFFICE);
        order.setCurrentOffice(origin);

        Order saved = orderRepository.save(order);
        createHistory(saved, OrderStatus.CREATED, origin, LocalDateTime.now().minusMinutes(30), "Created");
    }

    private Office ensureHub(String provinceCode, String name, String address) {
        Province prov = provinceRepository.findById(provinceCode).orElse(null);
        if (prov == null) return null;
        
        return officeRepository.findByOfficeName(name).orElseGet(() -> {
            Office hub = new Office();
            hub.setOfficeCode("HUB-DEMO-" + provinceCode);
            hub.setOfficeName(name);
            hub.setOfficeAddressLine1(address);
            hub.setOfficeType(OfficeType.HUB);
            hub.setRegion(prov.getAdministrativeRegion());
            hub.setOfficeEmail("hub." + provinceCode + "@f3postal.com");
            hub.setOfficePhoneNumber("024" + provinceCode);
            hub.setCapacity(50000);
            hub.setWard(wardRepository.findByProvince_Code(provinceCode).stream().findFirst().orElse(null));
            log.info("Created Demo Hub: {}", name);
            return officeRepository.save(hub);
        });
    }

    private Office ensurePostOffice(String officeName, String address, Ward ward, Office parent) {
        return officeRepository.findByOfficeName(officeName).orElseGet(() -> {
            Office office = new Office();
            office.setOfficeCode("PO-DEMO-" + ward.getCode());
            office.setOfficeName(officeName);
            office.setOfficeAddressLine1(address);
            office.setWard(ward);
            office.setRegion(ward.getProvince().getAdministrativeRegion());
            office.setOfficeType(OfficeType.WARD_POST);
            office.setParent(parent);
            office.setOfficeEmail("po." + ward.getCode() + "@f3postal.com");
            office.setOfficePhoneNumber("09" + ward.getCode());
            return officeRepository.save(office);
        });
    }

    /**
     * Create customer WITH account (for login capability)
     */
    private Customer ensureCustomerWithAccount(String name, String phone, String address, Ward ward) {
        // Check if account already exists
        Optional<Account> existingAccount = accountRepository.findByUsername(phone);
        if (existingAccount.isPresent()) {
            return customerRepository.findByAccount(existingAccount.get()).orElse(null);
        }

        // 1. Create Account
        Account account = new Account();
        account.setUsername(phone);
        account.setPassword(passwordEncoder.encode("123456"));
        account.setEmail(phone + "@customer.f3.com");
        account.setRole(Role.CUSTOMER);
        account.setActive(true);
        Account savedAccount = accountRepository.save(account);

        // 2. Create Customer (Linked via @MapsId)
        Customer customer = new Customer();
        customer.setAccount(savedAccount);
        customer.setFullName(name);
        customer.setPhoneNumber(phone);
        customer.setAddressLine1(address);
        customer.setWard(ward);

        log.info("Created Customer with Account: {} ({})", name, phone);
        return customerRepository.save(customer);
    }

    /**
     * Create customer WITHOUT account (walk-in customer)
     */
    private Customer ensureCustomer(String name, String phone, String address, Ward ward) {
        return customerRepository.findByPhoneNumber(phone).orElseGet(() -> {
            Customer c = new Customer();
            c.setFullName(name);
            c.setPhoneNumber(phone);
            c.setAddressLine1(address);
            c.setWard(ward);
            return customerRepository.save(c);
        });
    }

    private Ward ensureWard(String provinceCode, String wardName) {
        return wardRepository.findByProvince_Code(provinceCode).stream()
                .filter(w -> w.getName().contains(wardName))
                .findFirst().orElse(wardRepository.findByProvince_Code(provinceCode).stream().findFirst().orElse(null));
    }

    private Office getProvinceWarehouse(String provinceCode) {
        return officeRepository.findByProvinceCodeAndOfficeType(provinceCode, OfficeType.PROVINCE_WAREHOUSE)
                .stream().findFirst().orElse(null);
    }

    private void createHistory(Order order, OrderStatus status, Office office, LocalDateTime time, String desc) {
        OrderStatusHistory h = new OrderStatusHistory();
        h.setOrder(order);
        h.setStatus(status);
        h.setOffice(office);
        h.setCreatedAt(time);
        h.setDescription(desc);
        orderStatusHistoryRepository.save(h);
    }
}