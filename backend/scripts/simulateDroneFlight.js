import axios from 'axios';

const DRONE_ID = '692c24e083b1ad49c727c5ab'; // Thay bằng drone ID thật
const API_URL = 'http://127.0.0.1:5000/api/delivery'; // Dùng 127.0.0.1 thay vì localhost

// Tọa độ bắt đầu (nhà hàng)
const START_LAT = 10.762622;
const START_LNG = 106.660172;

// Tọa độ đích (khách hàng)
const END_LAT = 10.780000;
const END_LNG = 106.690000;

// Số bước di chuyển
const STEPS = 20;

// Delay giữa các bước (ms)
const DELAY = 2000; // 2 giây

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function simulateDroneFlight() {
  console.log('🚁 Bắt đầu mô phỏng bay drone...');
  console.log(`📍 Từ: ${START_LAT}, ${START_LNG}`);
  console.log(`📍 Đến: ${END_LAT}, ${END_LNG}`);
  console.log(`📊 ${STEPS} bước, mỗi bước ${DELAY/1000}s\n`);

  for (let i = 0; i <= STEPS; i++) {
    const progress = i / STEPS;
    
    // Tính tọa độ trung gian
    const lat = START_LAT + (END_LAT - START_LAT) * progress;
    const lng = START_LNG + (END_LNG - START_LNG) * progress;
    
    // Độ cao: tăng lên 100m rồi giảm xuống
    const altitude = Math.sin(progress * Math.PI) * 100;

    try {
      const response = await axios.patch(
        `${API_URL}/drone/${DRONE_ID}/location`,
        {
          latitude: lat,
          longitude: lng,
          altitude: Math.round(altitude)
        }
      );

      console.log(`✅ Bước ${i+1}/${STEPS+1}: lat=${lat.toFixed(6)}, lng=${lng.toFixed(6)}, alt=${Math.round(altitude)}m`);
    } catch (error) {
      console.error(`❌ Lỗi bước ${i+1}:`, error.response?.data?.message || error.message);
    }

    if (i < STEPS) {
      await sleep(DELAY);
    }
  }

  console.log('\n✅ Hoàn thành mô phỏng!');
  console.log(`\n📊 Kiểm tra locations trong MongoDB:`);
  console.log(`db.locations.find({ droneId: ObjectId("${DRONE_ID}") }).count()`);
  console.log(`\n🌐 Hoặc gọi API:`);
  console.log(`GET ${API_URL}/drone/${DRONE_ID}/location-history`);
}

simulateDroneFlight();
