/**
 * Ward-level coordinates mapping for Vietnam
 * Format: wardCode -> [latitude, longitude]
 * * Data source: Mapped from user SQL dump for Hanoi (Province 01)
 */

export const WARD_COORDINATES: Record<string, [number, number]> = {
    // --- BA ĐÌNH DISTRICT ---
    '00004': [21.0345, 105.8236], // Ba Đình (General/District Center)
    '00008': [21.0360, 105.8280], // Ngọc Hà
    '00025': [21.0285, 105.8185], // Giảng Võ

    // --- HOÀN KIẾM DISTRICT ---
    '00070': [21.0285, 105.8542], // Hoàn Kiếm (General)
    '00082': [21.0260, 105.8430], // Cửa Nam
    '00097': [21.0380, 105.8550], // Hồng Hà

    // --- TÂY HỒ DISTRICT ---
    '00103': [21.0550, 105.8200], // Tây Hồ (General)
    '00091': [21.0855, 105.8080], // Phú Thượng

    // --- LONG BIÊN DISTRICT ---
    '00145': [21.0350, 105.8900], // Long Biên (General)
    '00118': [21.0410, 105.8720], // Bồ Đề
    '00127': [21.0550, 105.9050], // Việt Hưng
    '00136': [21.0320, 105.9300], // Phúc Lợi

    // --- CẦU GIẤY DISTRICT ---
    '00166': [21.0350, 105.7950], // Cầu Giấy (General)
    '00160': [21.0460, 105.7980], // Nghĩa Đô
    '00175': [21.0210, 105.7920], // Yên Hòa

    // --- ĐỐNG ĐA DISTRICT ---
    '00235': [21.0150, 105.8250], // Đống Đa (General)
    '00190': [21.0180, 105.8265], // Ô Chợ Dừa
    '00199': [21.0120, 105.8080], // Láng (Láng Thượng/Hạ)
    '00226': [21.0270, 105.8350], // Văn Miếu - Quốc Tử Giám
    '00229': [21.0080, 105.8400], // Kim Liên

    // --- HAI BÀ TRƯNG DISTRICT ---
    '00256': [21.0100, 105.8500], // Hai Bà Trưng (General)
    '00283': [21.0020, 105.8700], // Vĩnh Tuy
    '00292': [21.0025, 105.8520], // Bạch Mai

    // --- HOÀNG MAI DISTRICT ---
    '00331': [20.9800, 105.8500], // Hoàng Mai (General)
    '00301': [20.9850, 105.8800], // Vĩnh Hưng
    '00316': [20.9780, 105.8350], // Định Công
    '00322': [20.9880, 105.8450], // Tương Mai
    '00328': [20.9820, 105.8950], // Lĩnh Nam
    '00337': [20.9620, 105.8320], // Hoàng Liệt (Linh Đàm area)
    '00340': [20.9700, 105.8750], // Yên Sở

    // --- THANH XUÂN DISTRICT ---
    '00367': [20.9950, 105.8050], // Thanh Xuân (General)
    '00352': [20.9920, 105.8380], // Phương Liệt
    '00364': [20.9880, 105.8150], // Khương Đình

    // --- BẮC TỪ LIÊM DISTRICT ---
    '00592': [21.0600, 105.7700], // Từ Liêm (General)
    '00598': [21.0950, 105.7450], // Thượng Cát
    '00602': [21.0920, 105.7820], // Đông Ngạc
    '00611': [21.0720, 105.7900], // Xuân Đỉnh
    '00613': [21.0580, 105.7350], // Tây Tựu (Flower village)
    '00619': [21.0450, 105.7650], // Phú Diễn

    // --- NAM TỪ LIÊM DISTRICT ---
    '00622': [21.0250, 105.7480], // Xuân Phương
    '00634': [21.0060, 105.7490], // Tây Mỗ (Smart City area)
    '00637': [20.9950, 105.7550], // Đại Mỗ

    // --- HÀ ĐÔNG DISTRICT ---
    '09556': [20.9700, 105.7700], // Hà Đông (General)
    '09552': [20.9550, 105.7850], // Kiến Hưng
    '09562': [20.9540, 105.7350], // Yên Nghĩa (Bus Station area)
    '09568': [20.9400, 105.7600], // Phú Lương
    '09886': [20.9650, 105.7450], // Dương Nội

    // --- GIA LÂM DISTRICT ---
    '00565': [21.0100, 105.9500], // Gia Lâm (General)
    '00577': [20.9960, 105.9135], // Bát Tràng (Ceramic Village)
    '00541': [21.0750, 105.9450], // Phù Đổng

    // --- ĐÔNG ANH DISTRICT ---
    '00454': [21.1400, 105.8450], // Đông Anh
    '00433': [21.2150, 105.8050], // Nội Bài (Airport area)

    // --- SÓC SƠN DISTRICT ---
    '00376': [21.2500, 105.8500], // Sóc Sơn
    '00430': [21.2200, 105.8550], // Đa Phúc

    // --- THANH TRÌ DISTRICT ---
    '00640': [20.9500, 105.8500], // Thanh Trì
    '00643': [20.9720, 105.8150], // Thanh Liệt
    '00664': [20.9600, 105.8000], // Đại Thanh
    '00679': [20.9350, 105.8520], // Ngọc Hồi

    // --- SƠN TÂY & BA VÌ (FAR WEST) ---
    '09574': [21.1400, 105.5000], // Sơn Tây
    '09700': [21.1800, 105.4000], // Ba Vì
    '09694': [21.1200, 105.4200], // Suối Hai (Lake)
    '09634': [21.2500, 105.3500], // Cổ Đô

    // --- HOÀI ĐỨC DISTRICT ---
    '09832': [21.0400, 105.7100], // Hoài Đức
    '09877': [21.0150, 105.7250], // An Khánh

    // --- THẠCH THẤT & QUỐC OAI ---
    '09955': [21.0300, 105.5800], // Thạch Thất
    '09988': [20.9900, 105.5400], // Hòa Lạc (Hi-Tech Park)
    '09895': [20.9800, 105.6500], // Quốc Oai

    // --- THƯỜNG TÍN & PHÚ XUYÊN (SOUTH) ---
    '10183': [20.8600, 105.8600], // Thường Tín
    '10273': [20.7500, 105.8900], // Phú Xuyên
};

/**
 * Check if a ward code has coordinates available
 */
export function hasWardCoordinates(wardCode: string | undefined): boolean {
    return wardCode ? wardCode in WARD_COORDINATES : false;
}

/**
 * Get ward coordinates if available
 */
export function getWardCoordinates(wardCode: string | undefined): [number, number] | null {
    return wardCode && WARD_COORDINATES[wardCode] ? WARD_COORDINATES[wardCode] : null;
}