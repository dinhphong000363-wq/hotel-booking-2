# 🗺️ Hướng Dẫn Sử Dụng OpenStreetMap + Leaflet

## 📋 Tổng Quan

Dự án này sử dụng **OpenStreetMap** với thư viện **React-Leaflet** để hiển thị bản đồ - hoàn toàn miễn phí, không cần API key.

### Các Component Có Sẵn:
1. **MapWithSearch.jsx** - Component bản đồ chính
2. **MapModal.jsx** - Modal hiển thị bản đồ toàn màn hình

---

## 🚀 Cài Đặt Dependencies

```bash
npm install leaflet react-leaflet
```

**Package.json cần có:**
```json
{
  "dependencies": {
    "leaflet": "^1.9.4",
    "react-leaflet": "^4.2.1"
  }
}
```

---

## 📦 1. Component MapWithSearch - Bản Đồ Cơ Bản

### Import và Sử Dụng:

```jsx
import MapWithSearch from '../components/MapWithSearch'

function MyComponent() {
  const address = "123 Đường ABC, Quận 1, TP.HCM"
  
  return (
    <div>
      <MapWithSearch 
        address={address}
        isExpanded={false}  // false = 400px, true = 600px
      />
    </div>
  )
}
```

### Props:
- **address** (string, required): Địa chỉ cần hiển thị
- **isExpanded** (boolean, optional): Kích thước bản đồ
  - `false` → 400px cao
  - `true` → 600px cao

### Tính Năng:
✅ Tự động geocode địa chỉ thành tọa độ  
✅ Hiển thị marker tại vị trí  
✅ Có thể zoom, pan, scroll  
✅ Hiển thị popup khi click marker  
✅ Loading state và error handling  

---

## 🎯 2. Component MapModal - Bản Đồ Popup

### Import và Sử Dụng:

```jsx
import { useState } from 'react'
import MapModal from '../components/MapModal'

function MyComponent() {
  const [showMap, setShowMap] = useState(false)
  const address = "123 Đường ABC, Quận 1, TP.HCM"
  
  return (
    <div>
      <button onClick={() => setShowMap(true)}>
        Xem Bản Đồ
      </button>
      
      <MapModal
        isOpen={showMap}
        onClose={() => setShowMap(false)}
        address={address}
      />
    </div>
  )
}
```

### Props:
- **isOpen** (boolean, required): Hiển thị/ẩn modal
- **onClose** (function, required): Callback khi đóng modal
- **address** (string, required): Địa chỉ cần hiển thị

### Tính Năng:
✅ Modal toàn màn hình với overlay  
✅ Nút "Mở Google Maps" để mở trên Google Maps web  
✅ Nút "Đóng" để đóng modal  
✅ Click overlay để đóng  

---

## 💡 3. Ví Dụ Thực Tế - Trang Chi Tiết Phòng

```jsx
import { useState, useRef } from 'react'
import MapWithSearch from '../components/MapWithSearch'
import MapModal from '../components/MapModal'

function RoomDetails({ room }) {
  const [mapExpanded, setMapExpanded] = useState(false)
  const [showMapModal, setShowMapModal] = useState(false)
  const mapSectionRef = useRef(null)
  
  const hotelAddress = room.hotel.fullAddress || room.hotel.address
  
  return (
    <div>
      {/* Địa chỉ có thể click để scroll xuống bản đồ */}
      <div className="flex items-center gap-2">
        <span
          className="cursor-pointer hover:text-indigo-600"
          onClick={() => {
            mapSectionRef.current?.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            })
            setTimeout(() => setMapExpanded(true), 500)
          }}
        >
          {hotelAddress}
        </span>
        
        {/* Nút mở Google Maps trực tiếp */}
        <button
          onClick={() => {
            const encoded = encodeURIComponent(hotelAddress)
            window.open(
              `https://www.google.com/maps/search/?api=1&query=${encoded}`, 
              '_blank'
            )
          }}
          className="px-3 py-1 bg-indigo-500 text-white rounded-lg"
        >
          Mở Maps
        </button>
      </div>
      
      {/* Phần bản đồ */}
      <div ref={mapSectionRef} className="mt-16">
        <h2 className="text-2xl font-semibold mb-6">Vị trí</h2>
        
        <div className="relative">
          <MapWithSearch
            address={hotelAddress}
            isExpanded={mapExpanded}
          />
          
          {/* Các nút overlay trên bản đồ */}
          <div className="absolute bottom-4 right-4 flex gap-2 z-[1000]">
            <button
              onClick={() => setShowMapModal(true)}
              className="px-4 py-2 bg-white rounded-lg shadow-lg"
            >
              Xem lớn hơn
            </button>
            
            <button
              onClick={() => {
                const encoded = encodeURIComponent(hotelAddress)
                window.open(
                  `https://www.google.com/maps/search/?api=1&query=${encoded}`,
                  '_blank'
                )
              }}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg"
            >
              Mở Google Maps
            </button>
          </div>
        </div>
      </div>
      
      {/* Modal */}
      <MapModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        address={hotelAddress}
      />
    </div>
  )
}
```

---

## 🎨 4. Tùy Chỉnh Bản Đồ

### Thay Đổi Vị Trí Mặc Định:

Trong `MapWithSearch.jsx`, tìm dòng:
```jsx
const defaultCenter = [16.0544, 108.2022]; // Đà Nẵng mặc định
```

Thay đổi thành tọa độ khác:
```jsx
const defaultCenter = [10.8231, 106.6297]; // TP.HCM
const defaultCenter = [21.0285, 105.8542]; // Hà Nội
```

### Thay Đổi Zoom Level:

```jsx
const zoom = isExpanded ? 16 : 14;
// 16 = zoom gần, 14 = zoom xa
// Có thể thay đổi từ 1-19
```

### Thay Đổi Kích Thước:

Trong component, tìm:
```jsx
className={`... ${isExpanded ? 'h-[600px]' : 'h-[400px]'}`}
```

Thay đổi thành:
```jsx
className={`... ${isExpanded ? 'h-[800px]' : 'h-[500px]'}`}
```

---

## 🔧 5. Xử Lý Lỗi

### Khi Không Tìm Thấy Địa Chỉ:

Component tự động hiển thị:
- Thông báo "Không thể tải bản đồ"
- Link "Mở trên Google Maps" để user tự tìm

### Khi Nominatim API Bị Giới Hạn:

Nominatim có rate limit: **1 request/giây**

Nếu gặp lỗi 429 (Too Many Requests), có thể:
1. Thêm delay giữa các request
2. Cache kết quả geocoding
3. Sử dụng service khác (MapBox, LocationIQ)

---

## 📝 6. Tạo Component Bản Đồ Mới

### Ví Dụ: Bản Đồ Danh Sách Khách Sạn

```jsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

function HotelListMap({ hotels }) {
  const center = [16.0544, 108.2022] // Trung tâm mặc định
  
  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: '500px', width: '100%' }}
      className="rounded-xl"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap'
      />
      
      {hotels.map((hotel) => (
        <Marker 
          key={hotel._id} 
          position={[hotel.latitude, hotel.longitude]}
        >
          <Popup>
            <div className="text-sm">
              <strong>{hotel.name}</strong>
              <p>{hotel.address}</p>
              <p className="text-indigo-600">{hotel.pricePerNight}đ/đêm</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
```

---

## 🌐 7. Geocoding API - Nominatim

### Cách Sử Dụng Trực Tiếp:

```javascript
async function geocodeAddress(address) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          'User-Agent': 'YourAppName/1.0' // Bắt buộc!
        }
      }
    )
    
    const data = await response.json()
    
    if (data && data.length > 0) {
      const { lat, lon } = data[0]
      return { 
        latitude: parseFloat(lat), 
        longitude: parseFloat(lon) 
      }
    }
    
    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

// Sử dụng:
const coords = await geocodeAddress("123 Lê Lợi, Quận 1, TP.HCM")
console.log(coords) // { latitude: 10.xxx, longitude: 106.xxx }
```

### Reverse Geocoding (Tọa độ → Địa chỉ):

```javascript
async function reverseGeocode(lat, lon) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      {
        headers: {
          'User-Agent': 'YourAppName/1.0'
        }
      }
    )
    
    const data = await response.json()
    return data.display_name // Địa chỉ đầy đủ
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return null
  }
}
```

---

## 🎯 8. Các Use Case Phổ Biến

### A. Hiển thị vị trí khách sạn đơn lẻ:
```jsx
<MapWithSearch address={hotel.address} isExpanded={false} />
```

### B. Modal bản đồ toàn màn hình:
```jsx
<MapModal 
  isOpen={showMap} 
  onClose={() => setShowMap(false)} 
  address={hotel.address} 
/>
```

### C. Mở Google Maps trong tab mới:
```jsx
const openGoogleMaps = (address) => {
  const encoded = encodeURIComponent(address)
  window.open(
    `https://www.google.com/maps/search/?api=1&query=${encoded}`,
    '_blank'
  )
}
```

### D. Hiển thị nhiều marker (danh sách khách sạn):
```jsx
<MapContainer center={[16.0544, 108.2022]} zoom={13}>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  {hotels.map(hotel => (
    <Marker key={hotel._id} position={[hotel.lat, hotel.lon]}>
      <Popup>{hotel.name}</Popup>
    </Marker>
  ))}
</MapContainer>
```

### E. Lấy vị trí hiện tại của user:
```javascript
navigator.geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude } = position.coords
    console.log('User location:', latitude, longitude)
  },
  (error) => {
    console.error('Geolocation error:', error)
  }
)
```

---

## ⚠️ 9. Lưu Ý Quan Trọng

### ✅ Ưu Điểm:
- **Miễn phí 100%** - Không cần API key
- **Không giới hạn** số lượng map views
- **Mã nguồn mở** - Có thể tùy chỉnh thoải mái
- **Nhẹ** - Không cần load Google Maps SDK

### ⚠️ Hạn Chế:
- **Nominatim rate limit**: 1 request/giây
- **Độ chính xác**: Có thể kém hơn Google Maps ở một số khu vực
- **Không có Street View**
- **Không có Directions API** (chỉ dẫn đường)

### 🔒 Best Practices:
1. **Luôn set User-Agent** khi gọi Nominatim API
2. **Cache kết quả geocoding** để tránh gọi API nhiều lần
3. **Xử lý error gracefully** - luôn có fallback
4. **Không abuse API** - respect rate limits
5. **Test với nhiều địa chỉ** - đặc biệt địa chỉ Việt Nam

---

## 🚀 10. Nâng Cao - Custom Marker Icon

```jsx
import L from 'leaflet'

// Tạo custom icon
const customIcon = new L.Icon({
  iconUrl: '/path/to/your/icon.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
})

// Sử dụng:
<Marker position={[lat, lon]} icon={customIcon}>
  <Popup>Custom marker!</Popup>
</Marker>
```

---

## 📚 11. Tài Liệu Tham Khảo

- **React-Leaflet**: https://react-leaflet.js.org/
- **Leaflet**: https://leafletjs.com/
- **OpenStreetMap**: https://www.openstreetmap.org/
- **Nominatim API**: https://nominatim.org/release-docs/latest/api/Overview/

---

## 🎉 Kết Luận

Bạn đã có sẵn hệ thống bản đồ hoàn chỉnh với OpenStreetMap + Leaflet. Chỉ cần:

1. Import component `MapWithSearch` hoặc `MapModal`
2. Truyền địa chỉ vào prop `address`
3. Xong! Bản đồ sẽ tự động hiển thị

**Không cần API key, không tốn phí, không giới hạn!** 🎊
