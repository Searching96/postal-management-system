package org.f3.postalmanagement.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.entity.actor.Customer;
import org.f3.postalmanagement.entity.actor.Employee;
import org.f3.postalmanagement.entity.administrative.Ward;
import org.f3.postalmanagement.entity.order.Order;
import org.f3.postalmanagement.entity.order.OrderStatusHistory;
import org.f3.postalmanagement.entity.unit.Office;
import org.f3.postalmanagement.enums.OfficeType;
import org.f3.postalmanagement.enums.OrderStatus;
import org.f3.postalmanagement.enums.PackageType;
import org.f3.postalmanagement.enums.Role;
import org.f3.postalmanagement.enums.ServiceType;
import org.f3.postalmanagement.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
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
    private final EmployeeRepository employeeRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("=== Starting Logistics Demo Scenario Seeding ===");

        // 1. Ensure Wards
        // user provided: 120 P.Yên Lãng, Đống Đa, Hà Nội (Hanoi)
        // user provided: Khu phố 34, Phường Linh Xuân, Thành phố Hồ Chí Minh (HCM)
        Ward hanoiWard = ensureWard("01", "Thịnh Quang"); // Approximating based on Dong Da
        Ward hcmWard = ensureWard("79", "Linh Xuân");

        if (hanoiWard == null || hcmWard == null) {
            log.error("Missing Ward data (Hanoi/HCM). Skipping demo seeding.");
            return;
        }

        // 2. Ensure Specific Post Offices (Realistic Names)
        Office hanoiPost = ensurePostOffice("Điểm dịch vụ SPX Hà Nội - Đống Đa 5", 
                "530 Láng, P. Láng Hạ ,Q. Đống Đa, TP Hà Nội", hanoiWard);
        
        Office hcmPost = ensurePostOffice("Điểm dịch vụ SPX TP. Hồ Chí Minh - Thủ Đức/ Linh Xuân", 
                "86 Quốc lộ 1K, Phường Linh Xuân, TP.HCM", hcmWard);
        
        // Find Hubs (Created by DataInitializer with realistic names hopefully, or fallback)
        Office hanoiHub = findHub("01", "Hong Delta Hub (Hà Nội SOC)");
        Office hcmHub = findHub("79", "Dong Nam Bo Hub (Củ Chi SOC)");

        // Find Province and Ward level offices for both cities
        Office hanoiProvinceWH = findOfficeByEmailOrType("warehouse.01@f3postal.com", OfficeType.PROVINCE_WAREHOUSE);
        Office hcmProvinceWH = findOfficeByEmailOrType("warehouse.79@f3postal.com", OfficeType.PROVINCE_WAREHOUSE);

        Office hanoiWardWH = findOfficeByEmailOrType("wh.ward1.01@f3postal.com", OfficeType.WARD_WAREHOUSE);
        Office hcmWardWH = findOfficeByEmailOrType("wh.ward1.79@f3postal.com", OfficeType.WARD_WAREHOUSE);

        Office hanoiWardPO = findOfficeByEmailOrType("po.ward1.01@f3postal.com", OfficeType.WARD_POST);
        Office hcmWardPO = findOfficeByEmailOrType("po.ward1.79@f3postal.com", OfficeType.WARD_POST);

        // 3. Create comprehensive staff for HANOI
        if (hanoiHub != null) {
            ensureStaffForOffice(hanoiHub, "0901000001", "Hub Admin HN", Role.HUB_ADMIN);
        }
        if (hanoiProvinceWH != null) {
            ensureStaffForOffice(hanoiProvinceWH, "0901000002", "WH Province Admin HN", Role.WH_PROVINCE_ADMIN);
            ensureStaffForOffice(hanoiProvinceWH, "0901000003", "WH Staff HN", Role.WH_STAFF);
        }
        if (hanoiWardWH != null) {
            ensureStaffForOffice(hanoiWardWH, "0901000004", "WH Ward Manager HN", Role.WH_WARD_MANAGER);
        }
        ensureStaffForOffice(hanoiPost, "0901000005", "PO Province Admin HN", Role.PO_PROVINCE_ADMIN);
        ensureStaffForOffice(hanoiPost, "0901000006", "PO Staff HN", Role.PO_STAFF);
        if (hanoiWardPO != null) {
            ensureStaffForOffice(hanoiWardPO, "0901000007", "PO Ward Manager HN", Role.PO_WARD_MANAGER);
        }
        ensureStaffForOffice(hanoiPost, "0901000008", "Shipper HN", Role.SHIPPER);

        // 4. Create comprehensive staff for HCM
        if (hcmHub != null) {
            ensureStaffForOffice(hcmHub, "0979000001", "Hub Admin HCM", Role.HUB_ADMIN);
        }
        if (hcmProvinceWH != null) {
            ensureStaffForOffice(hcmProvinceWH, "0979000002", "WH Province Admin HCM", Role.WH_PROVINCE_ADMIN);
            ensureStaffForOffice(hcmProvinceWH, "0979000003", "WH Staff HCM", Role.WH_STAFF);
        }
        if (hcmWardWH != null) {
            ensureStaffForOffice(hcmWardWH, "0979000004", "WH Ward Manager HCM", Role.WH_WARD_MANAGER);
        }
        ensureStaffForOffice(hcmPost, "0979000005", "PO Province Admin HCM", Role.PO_PROVINCE_ADMIN);
        ensureStaffForOffice(hcmPost, "0979000006", "PO Staff HCM", Role.PO_STAFF);
        if (hcmWardPO != null) {
            ensureStaffForOffice(hcmWardPO, "0979000007", "PO Ward Manager HCM", Role.PO_WARD_MANAGER);
        }
        Employee hcmShipper = ensureStaffForOffice(hcmPost, "0979000008", "Shipper Thủ Đức HCM", Role.SHIPPER);

        // 5. Create Main Customer & Receiver
        Customer sender = ensureCustomerWithAccount("Trần Nguyễn Đức Phúc", "0912345678",
                "120 P.Yên Lãng, Đống Đa", hanoiWard, "tranducphuc@gmail.com");

        Customer receiver = ensureCustomer("Trường Đại học Công nghệ Thông tin", "02837252002",
                "Khu phố 34, Phường Linh Xuân", hcmWard);

        // 6. Create Lifecycle Orders
        Employee creator = employeeRepository.findByOfficeId(hanoiPost.getId()).stream().findFirst()
                .orElse(employeeRepository.findAll().stream().findFirst().orElse(null));

        createLifecycleOrders(sender, receiver, hanoiPost, hcmPost, hanoiHub, hcmHub, creator, hcmShipper);

        log.info("=== Logistics Demo Scenarios Created Successfully ===");
    }
    
    private void createLifecycleOrders(Customer sender, Customer receiver, 
                                     Office hnPost, Office hcmPost, 
                                     Office hnHub, Office hcmHub,
                                     Employee creator, Employee hcmShipper) {
        
        List<OrderInfo> ordersToCreate = Arrays.asList(
            new OrderInfo("ORDER-01", OrderStatus.CREATED, "Đơn hàng mới tạo từ Hà Nội đi TP.HCM"),
            new OrderInfo("ORDER-02", OrderStatus.PENDING_PICKUP, "Chờ lấy hàng tại Hà Nội"),
            new OrderInfo("ORDER-03", OrderStatus.PICKED_UP, "Đã lấy hàng tại Hà Nội"),
            new OrderInfo("ORDER-04", OrderStatus.AT_ORIGIN_OFFICE, "Tại bưu cục Hà Nội"),
            new OrderInfo("ORDER-05", OrderStatus.IN_TRANSIT_TO_HUB, "Đang vận chuyển tới hub Hà Nội"),
            new OrderInfo("ORDER-06", OrderStatus.AT_HUB, "Tại hub Hà Nội", hnHub),
            new OrderInfo("ORDER-07", OrderStatus.IN_TRANSIT_TO_DESTINATION, "Đang vận chuyển từ HN tới HCM"),
            new OrderInfo("ORDER-08", OrderStatus.AT_DESTINATION_HUB, "Tại hub TP.HCM", hcmHub),
            new OrderInfo("ORDER-09", OrderStatus.IN_TRANSIT_TO_OFFICE, "Đang vận chuyển tới bưu cục HCM"),
            new OrderInfo("ORDER-10", OrderStatus.AT_DESTINATION_OFFICE, "Tại bưu cục TP.HCM", hcmPost),
            new OrderInfo("ORDER-11", OrderStatus.OUT_FOR_DELIVERY, "Đang giao hàng tại TP.HCM", hcmPost, hcmShipper),
            new OrderInfo("ORDER-12", OrderStatus.DELIVERED, "Đã giao thành công tại TP.HCM", hcmPost, hcmShipper)
        );

        for (OrderInfo info : ordersToCreate) {
             createOrderInStage(sender, receiver, hnPost, hcmPost, 
                               info.status, info.trackingNumber, creator, 
                               info.description, info.currentOffice, info.shipper);
        }
    }

    private void createOrderInStage(Customer sender, Customer receiver,
                                    Office originPost, Office destPost,
                                    OrderStatus targetStatus, String trackingNum,
                                    Employee creator, String description, 
                                    Office locationOverride, Employee assignedShipper) {
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
        order.setWeightKg(BigDecimal.valueOf(2.0));
        order.setChargeableWeightKg(BigDecimal.valueOf(2.0));
        order.setShippingFee(BigDecimal.valueOf(45000));
        order.setTotalAmount(BigDecimal.valueOf(45000));
        order.setCodAmount(BigDecimal.ZERO);
        order.setInsuranceFee(BigDecimal.ZERO);

        order.setStatus(targetStatus);
        
        // Determine current office logic
        Office current = locationOverride;
        if (current == null) {
            // Default current office logic based on status
            switch (targetStatus) {
                case AT_DESTINATION_OFFICE:
                case OUT_FOR_DELIVERY:
                case DELIVERED:
                case DELIVERY_FAILED:
                    current = destPost;
                    break;
                case AT_DESTINATION_HUB:
                case IN_TRANSIT_TO_OFFICE:
                     // Needs manual override usually, but fallback null
                     break;
                 default:
                     current = originPost;
            }
        }
        order.setCurrentOffice(current != null ? current : originPost);
        
        order.setInternalNotes("DEMO: " + description);
        if (assignedShipper != null) {
            order.setAssignedShipper(assignedShipper);
        }

        Order savedOrder = orderRepository.save(order);

        // Create Status History
        createStatusHistory(savedOrder, targetStatus, description);
        
        log.info("Created Demo Order: {} [{}]", trackingNum, targetStatus);
    }

    private void createStatusHistory(Order order, OrderStatus targetStatus, String finalDesc) {
        LocalDateTime now = LocalDateTime.now();
        // Always Created
        createHistory(order, OrderStatus.CREATED, order.getOriginOffice(), now.minusHours(48), "Đơn hàng được tạo");
        
        if (targetStatus == OrderStatus.CREATED) return;
        
        // Simple cascade for demo purposes
        createHistory(order, OrderStatus.PENDING_PICKUP, order.getOriginOffice(), now.minusHours(46), "Chờ lấy hàng");
        if (targetStatus == OrderStatus.PENDING_PICKUP) return;
        
        createHistory(order, OrderStatus.PICKED_UP, order.getOriginOffice(), now.minusHours(44), "Đã lấy hàng");
        if (targetStatus == OrderStatus.PICKED_UP) return;

        createHistory(order, OrderStatus.AT_ORIGIN_OFFICE, order.getOriginOffice(), now.minusHours(42), "Tại bưu cục gốc");
        if (targetStatus == OrderStatus.AT_ORIGIN_OFFICE) return;
        
        if (targetStatus == OrderStatus.DELIVERED || targetStatus == OrderStatus.OUT_FOR_DELIVERY || targetStatus == OrderStatus.AT_DESTINATION_OFFICE) {
             // Add intermediate hops for delivered items to make history look good
             createHistory(order, OrderStatus.IN_TRANSIT_TO_HUB, order.getOriginOffice(), now.minusHours(30), "Đang vận chuyển tới hub");
             createHistory(order, OrderStatus.AT_HUB, order.getOriginOffice(), now.minusHours(28), "Tại Hub gốc");
             createHistory(order, OrderStatus.IN_TRANSIT_TO_DESTINATION, order.getOriginOffice(), now.minusHours(24), "Đang trung chuyển");
             createHistory(order, OrderStatus.AT_DESTINATION_HUB, order.getDestinationOffice(), now.minusHours(10), "Tại Hub đích");
             createHistory(order, OrderStatus.IN_TRANSIT_TO_OFFICE, order.getDestinationOffice(), now.minusHours(5), "Về bưu cục đích");
             createHistory(order, OrderStatus.AT_DESTINATION_OFFICE, order.getDestinationOffice(), now.minusHours(3), "Tại bưu cục đích");
        }

        // Final status
        createHistory(order, targetStatus, order.getCurrentOffice(), now, finalDesc);
    }

    // === HELPERS ===
    
    private void createHistory(Order order, OrderStatus status, Office office, LocalDateTime time, String desc) {
        OrderStatusHistory h = new OrderStatusHistory();
        h.setOrder(order);
        h.setStatus(status);
        h.setOffice(office != null ? office : order.getCurrentOffice());
        h.setCreatedAt(time);
        h.setDescription(desc);
        orderStatusHistoryRepository.save(h);
    }

    private Ward ensureWard(String provinceCode, String wardName) {
        return wardRepository.findByProvince_Code(provinceCode).stream()
                .filter(w -> w.getName().contains(wardName))
                .findFirst()
                .orElse(wardRepository.findByProvince_Code(provinceCode).stream().findFirst().orElse(null));
    }

    private Office findHub(String provinceCode, String nameLike) {
        Optional<Office> byName = officeRepository.findByOfficeName(nameLike);
        if (byName.isPresent()) return byName.get();
        // Fallback to finding HUB in the same province's region
        List<Office> hubs = officeRepository.findAllByOfficeType(OfficeType.HUB);
        return hubs.stream()
                .filter(h -> h.getOfficeCode().equals("HUB-" + provinceCode))
                .findFirst()
                .orElse(null);
    }

    private Office findOfficeByEmailOrType(String email, OfficeType type) {
        Optional<Office> byEmail = officeRepository.findByOfficeEmail(email);
        if (byEmail.isPresent()) {
            return byEmail.get();
        }
        // Fallback: find any office of this type
        List<Office> offices = officeRepository.findAllByOfficeType(type);
        return offices.isEmpty() ? null : offices.get(0);
    }

    private Office ensurePostOffice(String name, String address, Ward ward) {
         return officeRepository.findByOfficeName(name).orElseGet(() -> {
            Office office = new Office();
            office.setOfficeCode("PO-SPX-" + ward.getCode() + "-DEMO");
            office.setOfficeName(name);
            office.setOfficeAddressLine1(address);
            office.setWard(ward);
            office.setRegion(ward.getProvince().getAdministrativeRegion());
            office.setOfficeType(OfficeType.PROVINCE_POST);
            office.setOfficeEmail("po." + ward.getCode() + ".demo@f3postal.com");
            office.setOfficePhoneNumber("09" + ward.getCode() + "1234");
            
            // Set parent to a warehouse in same province (fallback)
            office.setParent(officeRepository.findByProvinceCodeAndOfficeType(
                    ward.getProvince().getCode(), OfficeType.PROVINCE_WAREHOUSE)
                    .stream().findFirst().orElse(null));
            
            log.info("Created Demo Post Office: {}", name);
            return officeRepository.save(office);
        });
    }

    private Employee ensureStaffForOffice(Office office, String phone, String name, Role role) {
        Optional<Account> acc = accountRepository.findByUsername(phone);
        if (acc.isPresent()) {
            return employeeRepository.findByAccount(acc.get()).orElse(null);
        }
        
        Account account = new Account();
        account.setUsername(phone);
        account.setPassword(passwordEncoder.encode("123456"));
        account.setRole(role);
        account.setEmail(phone + "@demo.com");
        account.setActive(true);
        Account savedAccount = accountRepository.save(account);

        Employee emp = new Employee();
        emp.setAccount(savedAccount);
        emp.setFullName(name);
        emp.setPhoneNumber(phone);
        emp.setOffice(office);
        return employeeRepository.save(emp);
    }

    private Customer ensureCustomerWithAccount(String name, String phone, String address, Ward ward, String email) {
        Optional<Account> acc = accountRepository.findByUsername(phone);
        if (acc.isPresent()) return customerRepository.findByAccount(acc.get()).orElse(null);

        Account account = new Account();
        account.setUsername(phone);
        account.setPassword(passwordEncoder.encode("123456"));
        account.setRole(Role.CUSTOMER);
        account.setEmail(email);
        account.setActive(true);
        Account savedAccount = accountRepository.save(account);

        Customer c = new Customer();
        c.setAccount(savedAccount);
        c.setFullName(name);
        c.setPhoneNumber(phone);
        c.setAddressLine1(address);
        c.setWard(ward);
        log.info("Created Demo Customer: {}", name);
        return customerRepository.save(c);
    }

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

    @lombok.AllArgsConstructor
    class OrderInfo {
        String trackingNumber;
        OrderStatus status;
        String description;
        Office currentOffice;
        Employee shipper;
        
        OrderInfo(String t, OrderStatus s, String d) { this(t, s, d, null, null); }
        OrderInfo(String t, OrderStatus s, String d, Office c) { this(t, s, d, c, null); }
    }
}