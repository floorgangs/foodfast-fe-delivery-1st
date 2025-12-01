// Vietnam administrative divisions data
// Cities → Districts → Wards hierarchy

export interface Ward {
  code: string;
  name: string;
}

export interface District {
  code: string;
  name: string;
  wards: Ward[];
}

export interface City {
  code: string;
  name: string;
  districts: District[];
}

export const VIETNAM_LOCATIONS: City[] = [
  {
    code: 'HCM',
    name: 'TP. Hồ Chí Minh',
    districts: [
      {
        code: 'Q1',
        name: 'Quận 1',
        wards: [
          { code: 'BEN_NGHE', name: 'Phường Bến Nghé' },
          { code: 'BEN_THANH', name: 'Phường Bến Thành' },
          { code: 'NGUYEN_THAI_BINH', name: 'Phường Nguyễn Thái Bình' },
          { code: 'PHAM_NGU_LAO', name: 'Phường Phạm Ngũ Lão' },
          { code: 'CONG_TRUONG_ME_LINH', name: 'Phường Cống Trường Mẹ Linh' },
          { code: 'NGUYEN_CU_TRINH', name: 'Phường Nguyễn Cư Trinh' },
          { code: 'CAU_ONG_LANH', name: 'Phường Cầu Ông Lãnh' },
          { code: 'DA_KAO', name: 'Phường Đa Kao' },
          { code: 'TAN_DINH', name: 'Phường Tân Định' },
          { code: 'CO_GIANG', name: 'Phường Cô Giang' },
        ],
      },
      {
        code: 'Q3',
        name: 'Quận 3',
        wards: [
          { code: 'P1_Q3', name: 'Phường 1' },
          { code: 'P2_Q3', name: 'Phường 2' },
          { code: 'P3_Q3', name: 'Phường 3' },
          { code: 'P4_Q3', name: 'Phường 4' },
          { code: 'P5_Q3', name: 'Phường 5' },
          { code: 'P6_Q3', name: 'Phường 6' },
          { code: 'P7_Q3', name: 'Phường 7' },
          { code: 'P8_Q3', name: 'Phường 8' },
          { code: 'P9_Q3', name: 'Phường 9' },
          { code: 'P10_Q3', name: 'Phường 10' },
          { code: 'P11_Q3', name: 'Phường 11' },
          { code: 'P12_Q3', name: 'Phường 12' },
          { code: 'P13_Q3', name: 'Phường 13' },
          { code: 'P14_Q3', name: 'Phường 14' },
        ],
      },
      {
        code: 'Q7',
        name: 'Quận 7',
        wards: [
          { code: 'TAN_THUAN_DONG', name: 'Phường Tân Thuận Đông' },
          { code: 'TAN_THUAN_TAY', name: 'Phường Tân Thuận Tây' },
          { code: 'TAN_KIENG', name: 'Phường Tân Kiểng' },
          { code: 'TAN_HUNG', name: 'Phường Tân Hưng' },
          { code: 'BINH_THUAN', name: 'Phường Bình Thuận' },
          { code: 'TAN_QUY', name: 'Phường Tân Quy' },
          { code: 'PHU_THUAN', name: 'Phường Phú Thuận' },
          { code: 'TAN_PHU_Q7', name: 'Phường Tân Phú' },
          { code: 'TAN_PHU_Q7', name: 'Phường Tân Phong' },
          { code: 'PHU_MY', name: 'Phường Phú Mỹ' },
        ],
      },
      {
        code: 'BINH_THANH',
        name: 'Quận Bình Thạnh',
        wards: [
          { code: 'P1_BT', name: 'Phường 1' },
          { code: 'P2_BT', name: 'Phường 2' },
          { code: 'P3_BT', name: 'Phường 3' },
          { code: 'P5_BT', name: 'Phường 5' },
          { code: 'P6_BT', name: 'Phường 6' },
          { code: 'P7_BT', name: 'Phường 7' },
          { code: 'P11_BT', name: 'Phường 11' },
          { code: 'P12_BT', name: 'Phường 12' },
          { code: 'P13_BT', name: 'Phường 13' },
          { code: 'P14_BT', name: 'Phường 14' },
          { code: 'P15_BT', name: 'Phường 15' },
          { code: 'P17_BT', name: 'Phường 17' },
          { code: 'P19_BT', name: 'Phường 19' },
          { code: 'P21_BT', name: 'Phường 21' },
          { code: 'P22_BT', name: 'Phường 22' },
          { code: 'P24_BT', name: 'Phường 24' },
          { code: 'P25_BT', name: 'Phường 25' },
          { code: 'P26_BT', name: 'Phường 26' },
          { code: 'P27_BT', name: 'Phường 27' },
          { code: 'P28_BT', name: 'Phường 28' },
        ],
      },
      {
        code: 'THU_DUC',
        name: 'TP. Thủ Đức',
        wards: [
          { code: 'LINH_XUAN', name: 'Phường Linh Xuân' },
          { code: 'BINH_CHIEU', name: 'Phường Bình Chiểu' },
          { code: 'LINH_TRUNG', name: 'Phường Linh Trung' },
          { code: 'TAM_BINH', name: 'Phường Tam Bình' },
          { code: 'TAM_PHU', name: 'Phường Tam Phú' },
          { code: 'HIEP_BINH_PHUOC', name: 'Phường Hiệp Bình Phước' },
          { code: 'HIEP_BINH_CHANH', name: 'Phường Hiệp Bình Chánh' },
          { code: 'LINH_CHIEU', name: 'Phường Linh Chiểu' },
          { code: 'LINH_TAY', name: 'Phường Linh Tây' },
          { code: 'LINH_DONG', name: 'Phường Linh Đông' },
          { code: 'BINH_THO', name: 'Phường Bình Thọ' },
          { code: 'TRUONG_THO', name: 'Phường Trường Thọ' },
          { code: 'LONG_BINH', name: 'Phường Long Bình' },
          { code: 'LONG_THANH_MY', name: 'Phường Long Thạnh Mỹ' },
          { code: 'TAN_PHU_THU_DUC', name: 'Phường Tân Phú' },
          { code: 'HIEP_PHU', name: 'Phường Hiệp Phú' },
          { code: 'TAO_DAN', name: 'Phường Tăng Nhơn Phú A' },
          { code: 'TANG_NHON_PHU_B', name: 'Phường Tăng Nhơn Phú B' },
          { code: 'PHU_HUU', name: 'Phường Phú Hữu' },
          { code: 'TRUONG_THANH', name: 'Phường Trường Thạnh' },
          { code: 'LONG_PHUOC', name: 'Phường Long Phước' },
          { code: 'LONG_TRUONG', name: 'Phường Long Trường' },
          { code: 'CAT_LAI', name: 'Phường Cát Lái' },
          { code: 'THANH_MY_LOI', name: 'Phường Thạnh Mỹ Lợi' },
          { code: 'AN_PHU', name: 'Phường An Phú' },
          { code: 'AN_KHANH', name: 'Phường An Khánh' },
          { code: 'BINH_AN', name: 'Phường Bình An' },
          { code: 'BINH_TRUNG_DONG', name: 'Phường Bình Trưng Đông' },
          { code: 'BINH_TRUNG_TAY', name: 'Phường Bình Trưng Tây' },
          { code: 'THAO_DIEN', name: 'Phường Thảo Điền' },
        ],
      },
    ],
  },
  {
    code: 'HN',
    name: 'Hà Nội',
    districts: [
      {
        code: 'HOAN_KIEM',
        name: 'Quận Hoàn Kiếm',
        wards: [
          { code: 'HANG_BAI', name: 'Phường Hàng Bài' },
          { code: 'HANG_BO', name: 'Phường Hàng Bồ' },
          { code: 'HANG_BUOM', name: 'Phường Hàng Buồm' },
          { code: 'HANG_DAO', name: 'Phường Hàng Đào' },
          { code: 'HANG_GAI', name: 'Phường Hàng Gai' },
          { code: 'TRAN_HUNG_DAO', name: 'Phường Trần Hưng Đạo' },
          { code: 'PHAN_CHU_TRINH', name: 'Phường Phan Chu Trinh' },
          { code: 'CHUA_HANG', name: 'Phường Chương Dương' },
          { code: 'DONG_XUAN', name: 'Phường Đồng Xuân' },
          { code: 'LY_THAI_TO', name: 'Phường Lý Thái Tổ' },
        ],
      },
      {
        code: 'DONG_DA',
        name: 'Quận Đống Đa',
        wards: [
          { code: 'CAT_LINH', name: 'Phường Cát Linh' },
          { code: 'HANG_BOT', name: 'Phường Hàng Bột' },
          { code: 'LANG_THUONG', name: 'Phường Láng Thượng' },
          { code: 'QUANG_TRUNG', name: 'Phường Quang Trung' },
          { code: 'VAN_CHUONG', name: 'Phường Văn Chương' },
          { code: 'O_CHO_DUA', name: 'Phường Ô Chợ Dừa' },
          { code: 'VAN_MINH', name: 'Phường Văn Miếu' },
          { code: 'QUOC_TU_GIAM', name: 'Phường Quốc Tử Giám' },
          { code: 'LANG_HA', name: 'Phường Láng Hạ' },
          { code: 'KHUONG_THUONG', name: 'Phường Khương Thượng' },
        ],
      },
      {
        code: 'CAU_GIAY',
        name: 'Quận Cầu Giấy',
        wards: [
          { code: 'DICH_VONG', name: 'Phường Dịch Vọng' },
          { code: 'DICH_VONG_HAU', name: 'Phường Dịch Vọng Hậu' },
          { code: 'MAI_DICH', name: 'Phường Mai Dịch' },
          { code: 'NGHIA_DO', name: 'Phường Nghĩa Đô' },
          { code: 'NGHIA_TAN', name: 'Phường Nghĩa Tân' },
          { code: 'YEN_HOA', name: 'Phường Yên Hoà' },
          { code: 'QUAN_HOA', name: 'Phường Quan Hoa' },
          { code: 'TRUNG_HOA', name: 'Phường Trung Hoà' },
        ],
      },
    ],
  },
  {
    code: 'DN',
    name: 'Đà Nẵng',
    districts: [
      {
        code: 'HAI_CHAU',
        name: 'Quận Hải Châu',
        wards: [
          { code: 'THANH_BINH', name: 'Phường Thanh Bình' },
          { code: 'THUAN_PHUOC', name: 'Phường Thuận Phước' },
          { code: 'HAI_CHAU_1', name: 'Phường Hải Châu 1' },
          { code: 'HAI_CHAU_2', name: 'Phường Hải Châu 2' },
          { code: 'PHUOC_NINH', name: 'Phường Phước Ninh' },
          { code: 'HOA_THUAN_TAY', name: 'Phường Hoà Thuận Tây' },
          { code: 'HOA_THUAN_DONG', name: 'Phường Hoà Thuận Đông' },
          { code: 'NAM_DUONG', name: 'Phường Nam Dương' },
          { code: 'BINH_HIEN', name: 'Phường Bình Hiên' },
          { code: 'BINH_THUAN_DN', name: 'Phường Bình Thuận' },
          { code: 'HOA_CUONg', name: 'Phường Hoà Cường Bắc' },
          { code: 'HOA_CUONG_NAM', name: 'Phường Hoà Cường Nam' },
          { code: 'THACH_THANG', name: 'Phường Thạch Thang' },
        ],
      },
      {
        code: 'SON_TRA',
        name: 'Quận Sơn Trà',
        wards: [
          { code: 'THO_QUANG', name: 'Phường Thọ Quang' },
          { code: 'NHAT_BA', name: 'Phường Nại Hiên Đông' },
          { code: 'MAN_THAI', name: 'Phường Mân Thái' },
          { code: 'AN_HAI_BAC', name: 'Phường An Hải Bắc' },
          { code: 'PHU_MY_AN', name: 'Phường Phước Mỹ' },
          { code: 'AN_HAI_DONG', name: 'Phường An Hải Đông' },
          { code: 'AN_HAI_TAY', name: 'Phường An Hải Tây' },
        ],
      },
    ],
  },
];

// Helper function to find city by code
export const getCityByCode = (code: string): City | undefined => {
  return VIETNAM_LOCATIONS.find(city => city.code === code);
};

// Helper function to find district by code within a city
export const getDistrictByCode = (cityCode: string, districtCode: string): District | undefined => {
  const city = getCityByCode(cityCode);
  return city?.districts.find(district => district.code === districtCode);
};

// Helper function to find ward by code within a district
export const getWardByCode = (cityCode: string, districtCode: string, wardCode: string): Ward | undefined => {
  const district = getDistrictByCode(cityCode, districtCode);
  return district?.wards.find(ward => ward.code === wardCode);
};

// Helper function to get full address display name
export const getFullLocationName = (
  cityCode?: string,
  districtCode?: string,
  wardCode?: string
): string => {
  const parts: string[] = [];
  
  if (wardCode && districtCode && cityCode) {
    const ward = getWardByCode(cityCode, districtCode, wardCode);
    if (ward) parts.push(ward.name);
  }
  
  if (districtCode && cityCode) {
    const district = getDistrictByCode(cityCode, districtCode);
    if (district) parts.push(district.name);
  }
  
  if (cityCode) {
    const city = getCityByCode(cityCode);
    if (city) parts.push(city.name);
  }
  
  return parts.join(', ');
};
