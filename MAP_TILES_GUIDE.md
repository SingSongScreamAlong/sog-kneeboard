# SOG Kneeboard - Map Tiles & Assets Guide

## 🗺️ S.O.G. Prairie Fire DLC Maps

The kneeboard supports these Vietnam War maps from the S.O.G. Prairie Fire DLC:

### Supported Maps
1. **Cam Lao Nam** - 5120x5120m (main map)
2. **Khe Sanh** - 2048x2048m (combat base)
3. **The Bra** - 1024x1024m (small operations area)

---

## 📥 Obtaining Map Tiles

### Option 1: Extract from Arma 3 (Recommended)

Map tiles can be extracted directly from Arma 3 using community tools.

#### Required Tools:
1. **Arma 3 Tools** (Steam)
2. **PBO Manager** - https://www.armaholic.com/page.php?id=16369
3. **ImageToPAA** (included in Arma 3 Tools)

#### Extraction Process:

**Step 1: Locate Map Files**
```
C:\Program Files (x86)\Steam\steamapps\common\Arma 3\vn\addons\
```

Look for:
- `vn_map_cam_lao_nam.pbo`
- `vn_map_khe_sanh.pbo`
- `vn_map_the_bra.pbo`

**Step 2: Extract PBO Files**
1. Right-click PBO file → Extract with PBO Manager
2. Navigate to extracted folder
3. Look for `data\` or `satellite\` folders

**Step 3: Convert PAA to PNG**
```cmd
cd "C:\Program Files (x86)\Steam\steamapps\common\Arma 3 Tools\ImageToPAA"
Pal2PacE.exe -in "path\to\satellite_co.paa" -out "path\to\output.png"
```

### Option 2: Use Community Resources

Several community sites provide pre-extracted map tiles:

1. **Arma 3 Map Exporter**
   - https://github.com/gruppe-adler/grad_meh
   - Exports maps directly to web-friendly tiles

2. **Community Map Repositories**
   - Check Arma 3 modding forums
   - Discord communities often share resources

### Option 3: Generate from In-Game Screenshots

For quick setup without extraction:

1. Launch Arma 3 with S.O.G. Prairie Fire
2. Open map in editor
3. Take high-resolution screenshots
4. Stitch together using image editing software

---

## 🎨 Map Tile Specifications

### Leaflet.js Requirements

The kneeboard uses Leaflet.js with `CRS.Simple` (non-geographic coordinates).

#### Tile Structure:
```
public/tiles/
├── cam_lao_nam/
│   ├── {z}/
│   │   ├── {x}/
│   │   │   └── {y}.png
├── khe_sanh/
│   └── {z}/{x}/{y}.png
└── the_bra/
    └── {z}/{x}/{y}.png
```

#### Zoom Levels:
- **Cam Lao Nam**: 0-4 (large map)
- **Khe Sanh**: 0-3 (medium map)
- **The Bra**: 0-2 (small map)

#### Tile Size:
- Standard: 256x256 pixels
- High-DPI: 512x512 pixels (optional)

---

## 🛠️ Setting Up Map Tiles

### Method 1: Local Tiles (Offline)

**Step 1: Create Tile Directory**
```bash
mkdir -p public/tiles/cam_lao_nam
mkdir -p public/tiles/khe_sanh
mkdir -p public/tiles/the_bra
```

**Step 2: Add Tiles**
Place extracted/generated tiles in respective folders.

**Step 3: Update Frontend Code**

Edit `public/js/app.js` to use local tiles:

```javascript
// Add tile layer for current map
const tileLayer = L.tileLayer('tiles/{mapName}/{z}/{x}/{y}.png', {
    minZoom: 0,
    maxZoom: 4,
    tileSize: 256,
    noWrap: true
});
```

### Method 2: External Tile Server

Use a dedicated tile server for better performance:

**Step 1: Set Up Tile Server**
```bash
npm install -g tileserver-gl-light
```

**Step 2: Configure Tile Server**
```json
{
  "options": {
    "paths": {
      "root": "./public/tiles",
      "fonts": "fonts",
      "sprites": "sprites",
      "styles": "styles",
      "mbtiles": "mbtiles"
    }
  },
  "data": {
    "cam_lao_nam": {
      "mbtiles": "cam_lao_nam.mbtiles"
    }
  }
}
```

**Step 3: Run Tile Server**
```bash
tileserver-gl-light --config config.json
```

### Method 3: Use Satellite Imagery (Fallback)

For testing without extracted tiles:

```javascript
// Use OpenStreetMap as fallback
const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
});
```

---

## 📊 Map Metadata

### Cam Lao Nam
```javascript
{
    worldName: "vn_cam_lao_nam",
    displayName: "Cam Lao Nam",
    worldSize: 5120,
    center: [2560, 2560],
    bounds: [[0, 0], [5120, 5120]],
    minZoom: 0,
    maxZoom: 4
}
```

### Khe Sanh
```javascript
{
    worldName: "vn_khe_sanh",
    displayName: "Khe Sanh",
    worldSize: 2048,
    center: [1024, 1024],
    bounds: [[0, 0], [2048, 2048]],
    minZoom: 0,
    maxZoom: 3
}
```

### The Bra
```javascript
{
    worldName: "vn_the_bra",
    displayName: "The Bra",
    worldSize: 1024,
    center: [512, 512],
    bounds: [[0, 0], [1024, 1024]],
    minZoom: 0,
    maxZoom: 2
}
```

---

## 🎯 Quick Setup (No Tiles)

If you want to test without map tiles:

### Option A: Simple Grid Background

Edit `public/css/style.css`:

```css
#map {
    background: #2a2a2a;
    background-image: 
        linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px);
    background-size: 100px 100px;
}
```

### Option B: Topographic Style

```css
#map {
    background: #3d4a3a;
    background-image: 
        repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,.1) 10px, rgba(0,0,0,.1) 20px),
        repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(0,0,0,.1) 10px, rgba(0,0,0,.1) 20px);
}
```

### Option C: Vietnam Terrain Colors

```css
#map {
    background: linear-gradient(180deg, 
        #4a5f3a 0%,    /* Jungle green */
        #5a6f4a 50%,   /* Mid green */
        #3a4a2a 100%   /* Dark green */
    );
}
```

---

## 🔧 Advanced: Automatic Map Detection

Update `@SOG_Kneeboard/scripts/fn_getWorldMeta.sqf` to detect and send map info:

```sqf
private _worldName = worldName;
private _worldSize = worldSize;
private _terrainName = _worldName;
private _tileBaseUrl = "";

// Detect S.O.G. maps and set tile URLs
switch (_worldName) do {
    case "vn_cam_lao_nam": {
        _terrainName = "Cam Lao Nam";
        _worldSize = 5120;
        _tileBaseUrl = "http://localhost:31337/tiles/cam_lao_nam";
    };
    case "vn_khe_sanh": {
        _terrainName = "Khe Sanh";
        _worldSize = 2048;
        _tileBaseUrl = "http://localhost:31337/tiles/khe_sanh";
    };
    case "vn_the_bra": {
        _terrainName = "The Bra";
        _worldSize = 1024;
        _tileBaseUrl = "http://localhost:31337/tiles/the_bra";
    };
    default {
        _terrainName = _worldName;
        _tileBaseUrl = "";
    };
};
```

---

## 📦 Tile Generation Tools

### Tool 1: GRAD Map Export Helper
```bash
# Install
git clone https://github.com/gruppe-adler/grad_meh.git
cd grad_meh
npm install

# Export map
node index.js --world vn_cam_lao_nam --output ./tiles
```

### Tool 2: Arma 3 Map Exporter
```bash
# Python-based exporter
pip install arma3-map-exporter
arma3-map-export --map cam_lao_nam --output ./tiles
```

### Tool 3: Manual Tile Cutter

Use ImageMagick to cut large map images into tiles:

```bash
# Install ImageMagick
# Windows: https://imagemagick.org/script/download.php

# Cut image into tiles
magick convert satellite.png -crop 256x256 -set filename:tile "%[fx:page.x/256]_%[fx:page.y/256]" +repage +adjoin "tiles/%[filename:tile].png"
```

---

## 🌐 Online Resources

### Official Resources
- **Arma 3 Tools**: Steam → Library → Tools → Arma 3 Tools
- **S.O.G. Prairie Fire**: https://store.steampowered.com/app/1227700/

### Community Resources
- **Arma 3 Modding Discord**: https://discord.gg/arma
- **Bohemia Interactive Forums**: https://forums.bohemia.net/
- **Arma 3 Subreddit**: https://reddit.com/r/arma

### Modding Tools
- **PBO Manager**: https://www.armaholic.com/page.php?id=16369
- **Mikero's Tools**: https://mikero.bytex.digital/Downloads
- **GRAD Map Export**: https://github.com/gruppe-adler/grad_meh

---

## 📝 Legal Considerations

### Important Notes:
1. **Map tiles are Bohemia Interactive's property**
2. **Only extract for personal use**
3. **Do not redistribute extracted assets**
4. **Respect Arma 3 EULA and Terms of Service**
5. **S.O.G. Prairie Fire DLC required** for legal access

### Recommended Approach:
- Extract tiles yourself from your legal copy
- Use for personal kneeboard only
- Do not share extracted tiles publicly
- Consider using generic backgrounds for public releases

---

## 🚀 Quick Start (Without Tiles)

The kneeboard works perfectly without map tiles:

1. **Uses coordinate-based positioning**
2. **Grid background automatically generated**
3. **Markers work on any background**
4. **Position tracking functional**

To use immediately:
```bash
npm run all
# Open http://localhost:31337
# Map shows with grid background
# Full functionality available
```

Add tiles later when you have time to extract them!

---

## 🆘 Troubleshooting

### Tiles Not Loading
- Check file paths match tile URL pattern
- Verify tile files are PNG format
- Check browser console for 404 errors
- Ensure correct zoom level range

### Performance Issues
- Reduce max zoom level
- Use smaller tile sizes (256x256)
- Enable tile caching
- Consider tile server instead of static files

### Map Not Centered
- Verify world size matches map
- Check center coordinates
- Adjust bounds in map configuration

---

## ✅ Checklist

For complete map tile setup:

- [ ] Install Arma 3 Tools
- [ ] Install PBO Manager
- [ ] Extract map PBO files
- [ ] Convert PAA to PNG
- [ ] Generate tile structure
- [ ] Place tiles in public/tiles/
- [ ] Update frontend code
- [ ] Test in browser
- [ ] Verify zoom levels work
- [ ] Check performance

---

## 🎖️ Summary

**Without Tiles**: Kneeboard works perfectly with grid background
**With Tiles**: Enhanced visual experience with actual terrain

**Recommended**: Start without tiles, add them later for enhanced visuals.

**The kneeboard is fully functional either way!**

---

**Version 1.0.0** - Map Tiles Guide
**Last Updated:** October 17, 2025
