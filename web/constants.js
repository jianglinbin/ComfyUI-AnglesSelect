export const AZIMUTH_MAP = {
    0: "front view",
    45: "front-right quarter view", 
    90: "right side view",
    135: "back-right quarter view",
    180: "back view",
    225: "back-left quarter view",
    270: "left side view",
    315: "front-left quarter view"
};

export const ELEVATION_MAP = {
    "-30": "low-angle shot",
    "0": "eye-level shot",
    "30": "elevated shot",
    "60": "high-angle shot"
};

export const DISTANCE_MAP = {
    0: { name: "close-up", radius: 80, color: 0xFF6B6B },
    1: { name: "medium shot", radius: 130, color: 0xFFD93D },
    2: { name: "wide shot", radius: 200, color: 0x6BCB77 }
};

export const AZIMUTHS = [0, 45, 90, 135, 180, 225, 270, 315];
export const ELEVATIONS = [-30, 0, 30, 60];
