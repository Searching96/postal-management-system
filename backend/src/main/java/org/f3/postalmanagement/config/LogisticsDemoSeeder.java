package org.f3.postalmanagement.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import java.util.*;
import java.util.stream.Collectors;

/**
 * LogisticsDemoSeeder seeds demo data for inter-ward, inter-province, and inter-region routing scenarios.
 * Uses real SPX data for Hà Nội and TP.HCM, creates demo orders for all major flows.
 *
 * - Wards, post offices, hubs, office pairs
 * - Demo customer and receiver
 * - Demo orders for all scenarios, tagged for UI/API verification
 */
@Component
@Order(3)
@Slf4j
@RequiredArgsConstructor
public class LogisticsDemoSeeder implements CommandLineRunner {

    // Inject repositories and encoder
    private final org.f3.postalmanagement.repository.ProvinceRepository provinceRepository;
    private final org.f3.postalmanagement.repository.WardRepository wardRepository;
    private final org.f3.postalmanagement.repository.OfficeRepository officeRepository;
    private final org.f3.postalmanagement.repository.OfficePairRepository officePairRepository;
    private final org.f3.postalmanagement.repository.AccountRepository accountRepository;
    private final org.f3.postalmanagement.repository.EmployeeRepository employeeRepository;
    private final org.f3.postalmanagement.repository.CustomerRepository customerRepository;
    private final org.f3.postalmanagement.repository.OrderRepository orderRepository;
    private final org.f3.postalmanagement.repository.OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final org.f3.postalmanagement.repository.BatchPackageRepository batchPackageRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    // --- Real data (simulate loading from AdministrativeData.md and PostalOfficeData.md) ---
    // In a real implementation, you would parse the JSON/MD files. Here, we simulate with hardcoded samples for brevity.
    private static final List<Map<String, String>> HANOI_WARDS = Arrays.asList(
        Map.of("code", "01001", "name", "Phường Phúc Xá"),
        Map.of("code", "01002", "name", "Phường Trúc Bạch"),
        Map.of("code", "01003", "name", "Phường Vĩnh Phúc")
        // ... add more from AdministrativeData.md
    );
    private static final List<Map<String, String>> HCM_WARDS = Arrays.asList(
        Map.of("code", "79001", "name", "Phường Tân Định"),
        Map.of("code", "79002", "name", "Phường Đa Kao"),
        Map.of("code", "79003", "name", "Phường Bến Nghé")
        // ... add more from AdministrativeData.md
    );
    private static final List<Map<String, String>> HANOI_POST_OFFICES = Arrays.asList(
        Map.of("email", "po.01001@f3postal.com", "name", "Bưu cục Phúc Xá", "wardCode", "01001"),
        Map.of("email", "po.01002@f3postal.com", "name", "Bưu cục Trúc Bạch", "wardCode", "01002")
        // ... add more from PostalOfficeData.md
    );
    private static final List<Map<String, String>> HCM_POST_OFFICES = Arrays.asList(
        Map.of("email", "po.79001@f3postal.com", "name", "Bưu cục Tân Định", "wardCode", "79001"),
        Map.of("email", "po.79002@f3postal.com", "name", "Bưu cục Đa Kao", "wardCode", "79002")
        // ... add more from PostalOfficeData.md
    );

    // Demo constants
    private static final String HANOI = "Hà Nội";
    private static final String HCM = "TP. Hồ Chí Minh";
    private static final String DEMO_CUSTOMER_PHONE = "0999999999";
    private static final String DEMO_RECEIVER_PHONE = "0888888888";

    @Override
    public void run(String... args) {
        log.info("[LogisticsDemoSeeder] Starting real-data demo seeding for Hà Nội and TP.HCM...");
        var hanoi = provinceRepository.findAll().stream().filter(p -> HANOI.equals(p.getName())).findFirst().orElse(null);
        var hcm = provinceRepository.findAll().stream().filter(p -> HCM.equals(p.getName())).findFirst().orElse(null);
        if (hanoi == null || hcm == null) {
            log.warn("Demo provinces not found. Aborting demo seeding.");
            return;
        }

        // 1. Load all existing wards for Hà Nội and TP.HCM
        Map<String, org.f3.postalmanagement.entity.administrative.Ward> hanoiWardMap = wardRepository.findByProvince_Code(hanoi.getCode())
            .stream().collect(Collectors.toMap(org.f3.postalmanagement.entity.administrative.Ward::getCode, w -> w));
        Map<String, org.f3.postalmanagement.entity.administrative.Ward> hcmWardMap = wardRepository.findByProvince_Code(hcm.getCode())
            .stream().collect(Collectors.toMap(org.f3.postalmanagement.entity.administrative.Ward::getCode, w -> w));

        // 2. Create all real post offices for Hà Nội and TP.HCM
        List<org.f3.postalmanagement.entity.unit.Office> hanoiOffices = new ArrayList<>();
        for (var poData : HANOI_POST_OFFICES) {
            var ward = hanoiWardMap.get(poData.get("wardCode"));
            if (ward == null) continue;
            var office = ensureOffice(hanoi, ward, poData.get("name"), poData.get("email"), org.f3.postalmanagement.enums.OfficeType.WARD_POST);
            hanoiOffices.add(office);
        }
        List<org.f3.postalmanagement.entity.unit.Office> hcmOffices = new ArrayList<>();
        for (var poData : HCM_POST_OFFICES) {
            var ward = hcmWardMap.get(poData.get("wardCode"));
            if (ward == null) continue;
            var office = ensureOffice(hcm, ward, poData.get("name"), poData.get("email"), org.f3.postalmanagement.enums.OfficeType.WARD_POST);
            hcmOffices.add(office);
        }

        // 3. Create OfficePairs for each office (simulate warehouse for each post office)
        for (var office : hanoiOffices) {
            var wh = ensureOffice(hanoi, office.getWard(), "Kho " + office.getOfficeName(), "wh." + office.getOfficeEmail(), org.f3.postalmanagement.enums.OfficeType.WARD_WAREHOUSE);
            ensureOfficePair(wh, office);
        }
        for (var office : hcmOffices) {
            var wh = ensureOffice(hcm, office.getWard(), "Kho " + office.getOfficeName(), "wh." + office.getOfficeEmail(), org.f3.postalmanagement.enums.OfficeType.WARD_WAREHOUSE);
            ensureOfficePair(wh, office);
        }

        // 4. Create demo customer and receiver (assign to first ward in each city)
        var demoCustomer = ensureDemoCustomer("Demo Customer", DEMO_CUSTOMER_PHONE, hanoiWardMap.values().stream().findFirst().orElse(null), hanoi);
        var demoReceiver = ensureDemoCustomer("Demo Receiver", DEMO_RECEIVER_PHONE, hcmWardMap.values().stream().findFirst().orElse(null), hcm);

        // 5. Create demo orders for all scenarios using real offices
        if (!hanoiOffices.isEmpty() && !hcmOffices.isEmpty()) {
            createDemoOrder(demoCustomer, demoReceiver, hanoiOffices.get(0), hanoiOffices.get(1 % hanoiOffices.size()), hcmOffices.get(0), hcmOffices.get(1 % hcmOffices.size()), hanoiWardMap.values().stream().findFirst().orElse(null), hcmWardMap.values().stream().findFirst().orElse(null));
        }

        log.info("[LogisticsDemoSeeder] Real-data demo seeding complete.");
    }

    private org.f3.postalmanagement.entity.administrative.Ward ensureWard(org.f3.postalmanagement.entity.administrative.Province province, String name, String code) {
        return wardRepository.findById(code).orElseGet(() -> {
            var ward = new org.f3.postalmanagement.entity.administrative.Ward();
            ward.setCode(code);
            ward.setName(name);
            ward.setProvince(province);
            return wardRepository.save(ward);
        });
    }

    private org.f3.postalmanagement.entity.unit.Office ensureOffice(org.f3.postalmanagement.entity.administrative.Province province,
            org.f3.postalmanagement.entity.administrative.Ward ward, String name, String email, org.f3.postalmanagement.enums.OfficeType type) {
        return officeRepository.findByOfficeEmail(email).orElseGet(() -> {
            var office = new org.f3.postalmanagement.entity.unit.Office();
            office.setOfficeName(name);
            office.setOfficeEmail(email);
            office.setOfficePhoneNumber("0912345678");
            office.setOfficeAddressLine1("Demo Address " + name);
            office.setRegion(province.getAdministrativeRegion());
            office.setProvince(province);
            office.setWard(ward);
            office.setOfficeType(type);
            office.setCapacity(1000);
            office.setIsAcceptingOrders(true);
            office.setWorkingHours("08:00-17:00");
            return officeRepository.save(office);
        });
    }

    private void ensureOfficePair(org.f3.postalmanagement.entity.unit.Office wh, org.f3.postalmanagement.entity.unit.Office po) {
        officePairRepository.findByWhOffice(wh).orElseGet(() -> {
            var pair = new org.f3.postalmanagement.entity.unit.OfficePair();
            pair.setWhOffice(wh);
            pair.setPoOffice(po);
            return officePairRepository.save(pair);
        });
    }

    private org.f3.postalmanagement.entity.actor.Customer ensureDemoCustomer(String name, String phone, org.f3.postalmanagement.entity.administrative.Ward ward, org.f3.postalmanagement.entity.administrative.Province province) {
        return customerRepository.findAll().stream().filter(c -> phone.equals(c.getPhoneNumber())).findFirst().orElseGet(() -> {
            var account = new org.f3.postalmanagement.entity.actor.Account();
            account.setUsername(phone);
            account.setPassword(passwordEncoder.encode("123456"));
            account.setRole(org.f3.postalmanagement.enums.Role.CUSTOMER);
            account.setEmail(phone + "@demo.com");
            account.setActive(true);
            account = accountRepository.save(account);

            var customer = new org.f3.postalmanagement.entity.actor.Customer();
            customer.setAccount(account);
            customer.setFullName(name);
            customer.setPhoneNumber(phone);
            customer.setAddressLine1("Demo Address for " + name);
            customer.setWard(ward);
            customer.setProvince(province);
            customer.setSubscriptionPlan(org.f3.postalmanagement.enums.SubscriptionPlan.BASIC);
            return customerRepository.save(customer);
        });
    }

    private void createDemoOrder(org.f3.postalmanagement.entity.actor.Customer demoCustomer,
                                 org.f3.postalmanagement.entity.actor.Customer demoReceiver,
                                 org.f3.postalmanagement.entity.unit.Office hanoiPo,
                                 org.f3.postalmanagement.entity.unit.Office hanoiWh,
                                 org.f3.postalmanagement.entity.unit.Office hcmPo,
                                 org.f3.postalmanagement.entity.unit.Office hcmWh,
                                 org.f3.postalmanagement.entity.administrative.Ward hanoiWard,
                                 org.f3.postalmanagement.entity.administrative.Ward hcmWard) {
        // Inter-ward (same province, different ward)
        createOrder("DEMO-INTER-WARD", demoCustomer, demoReceiver, hanoiPo, hanoiWh, hanoiWard, hanoiWard, "Inter-ward demo order", "DEMO:INTER_WARD");
        // Inter-province (Hà Nội → TP.HCM)
        createOrder("DEMO-INTER-PROVINCE", demoCustomer, demoReceiver, hanoiPo, hcmPo, hanoiWard, hcmWard, "Inter-province demo order", "DEMO:INTER_PROVINCE");
        // Inter-region (Hà Nội → TP.HCM, different regions)
        createOrder("DEMO-INTER-REGION", demoCustomer, demoReceiver, hanoiPo, hcmPo, hanoiWard, hcmWard, "Inter-region demo order", "DEMO:INTER_REGION");
    }

    private void createOrder(String trackingNumber,
                             org.f3.postalmanagement.entity.actor.Customer sender,
                             org.f3.postalmanagement.entity.actor.Customer receiver,
                             org.f3.postalmanagement.entity.unit.Office originOffice,
                             org.f3.postalmanagement.entity.unit.Office destOffice,
                             org.f3.postalmanagement.entity.administrative.Ward senderWard,
                             org.f3.postalmanagement.entity.administrative.Ward receiverWard,
                             String description,
                             String tag) {
        if (orderRepository.findByTrackingNumber(trackingNumber).isPresent()) return;
        var order = new org.f3.postalmanagement.entity.order.Order();
        order.setTrackingNumber(trackingNumber);
        order.setSenderCustomer(sender);
        order.setSenderName(sender.getFullName());
        order.setSenderPhone(sender.getPhoneNumber());
        order.setSenderAddressLine1(sender.getAddressLine1());
        order.setSenderWard(senderWard);
        order.setReceiverName(receiver.getFullName());
        order.setReceiverPhone(receiver.getPhoneNumber());
        order.setReceiverAddressLine1(receiver.getAddressLine1());
        order.setReceiverWard(receiverWard);
        order.setOriginOffice(originOffice);
        order.setDestinationOffice(destOffice);
        order.setCreatedByEmployee(employeeRepository.findAll().stream().findFirst().orElse(null));
        order.setPackageType(org.f3.postalmanagement.enums.PackageType.BOX);
        order.setWeightKg(java.math.BigDecimal.valueOf(1.0));
        order.setChargeableWeightKg(java.math.BigDecimal.valueOf(1.0));
        order.setServiceType(org.f3.postalmanagement.enums.ServiceType.EXPRESS);
        order.setShippingFee(java.math.BigDecimal.valueOf(30000));
        order.setTotalAmount(java.math.BigDecimal.valueOf(31000));
        order.setStatus(org.f3.postalmanagement.enums.OrderStatus.CREATED);
        order.setDeliveryInstructions(tag);
        order.setInternalNotes(description);
        orderRepository.save(order);
    }
}
