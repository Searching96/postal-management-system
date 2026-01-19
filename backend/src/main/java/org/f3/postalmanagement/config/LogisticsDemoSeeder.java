package org.f3.postalmanagement.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

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

        Customer sender = ensureCustomer("Phùng Thanh Độ", "0912345678", "120 P.Yên Lãng", hanoiWard);
        Customer receiver = ensureCustomer("Trường ĐH CNTT", "02837252002", "Khu phố 34", hcmWard);
        Employee defaultCreator = employeeRepository.findAll().stream().findFirst().orElse(null);

        // CREATE DEMO ORDERS
        createInterRegionDemoOrder(sender, receiver, hanoiPost, hcmPost, hanoiHub, hcmHub, hanoiProvinceWH, hcmProvinceWH, defaultCreator);
        createInterProvinceDemoOrder(sender, hanoiPost, hanoiHub, defaultCreator);
        createInterWardDemoOrder(sender, hanoiPost, defaultCreator);

        log.info("=== Logistics Demo Scenarios Created Successfully ===");
    }

    private void createInterRegionDemoOrder(Customer sender, Customer receiver, 
                                            Office originPost, Office destPost, 
                                            Office hubOrigin, Office hubDest, 
                                            Office provinceOrigin, Office provinceDest,
                                            Employee creator) {
        // Ensure short unique tracking number < 15 chars
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
        
        // MANDATORY FIELDS
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
        
        // Create History
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
        
        // MANDATORY FIELDS
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
        
        // MANDATORY FIELDS
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

    // Helpers
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