import React from 'react'
import MapWithSearch from '../hotel/MapWithSearch'

const MapModal = ({ isOpen, onClose, address }) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-xl font-semibold text-gray-800">Bản đồ</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
                </div>
                <div className="p-4">
                    <MapWithSearch address={address} isExpanded={true} />
                </div>
                <div className="p-4 border-t flex justify-end gap-3 relative z-10">
                    <button
                        onClick={() => {
                            const encodedAddress = encodeURIComponent(address);
                            window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
                        }}
                        className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Mở Google Maps
                    </button>
                    <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all">
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    )
}

export default MapModal
