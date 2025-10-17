# Map Tile Extraction Tool Guide

## 🛠️ Automated Map Tile Extraction

This guide helps you extract map tiles from Arma 3 S.O.G. Prairie Fire DLC.

---

## Prerequisites

### Required Software
1. **Arma 3** with S.O.G. Prairie Fire DLC installed
2. **Arma 3 Tools** (from Steam)
3. **PBO Manager** - Download: https://www.armaholic.com/page.php?id=16369
4. **ImageMagick** - Download: https://imagemagick.org/script/download.php

### Installation Paths
```
Arma 3: C:\Program Files (x86)\Steam\steamapps\common\Arma 3\
Arma 3 Tools: C:\Program Files (x86)\Steam\steamapps\common\Arma 3 Tools\
```

---

## Step-by-Step Extraction

### Step 1: Locate Map PBO Files

Navigate to:
```
C:\Program Files (x86)\Steam\steamapps\common\Arma 3\vn\addons\
```

Find these files:
- `vn_map_cam_lao_nam.pbo` (main map)
- `vn_map_khe_sanh.pbo` (combat base)
- `vn_map_the_bra.pbo` (small area)

### Step 2: Extract PBO Files

**Using PBO Manager:**
1. Right-click on `vn_map_cam_lao_nam.pbo`
2. Select "Extract to..."
3. Choose destination: `C:\Temp\arma3_maps\cam_lao_nam\`
4. Repeat for other maps

**Using Command Line (Mikero's Tools):**
```cmd
extractPbo.exe "vn_map_cam_lao_nam.pbo" "C:\Temp\arma3_maps\cam_lao_nam\"
```

### Step 3: Find Satellite Images

Look for satellite/terrain images in extracted folders:
```
C:\Temp\arma3_maps\cam_lao_nam\data\
C:\Temp\arma3_maps\cam_lao_nam\data\layers\
```

Common filenames:
- `satellite_co.paa`
- `sat_lco.paa`
- `terrain_co.paa`

### Step 4: Convert PAA to PNG

**Using Pal2PacE (from Arma 3 Tools):**
```cmd
cd "C:\Program Files (x86)\Steam\steamapps\common\Arma 3 Tools\ImageToPAA"

Pal2PacE.exe -in "C:\Temp\arma3_maps\cam_lao_nam\data\satellite_co.paa" -out "C:\Temp\arma3_maps\cam_lao_nam_satellite.png"
```

**Batch convert all maps:**
```cmd
@echo off
set TOOLS="C:\Program Files (x86)\Steam\steamapps\common\Arma 3 Tools\ImageToPAA"
set INPUT=C:\Temp\arma3_maps
set OUTPUT=C:\Temp\arma3_tiles

%TOOLS%\Pal2PacE.exe -in "%INPUT%\cam_lao_nam\data\satellite_co.paa" -out "%OUTPUT%\cam_lao_nam.png"
%TOOLS%\Pal2PacE.exe -in "%INPUT%\khe_sanh\data\satellite_co.paa" -out "%OUTPUT%\khe_sanh.png"
%TOOLS%\Pal2PacE.exe -in "%INPUT%\the_bra\data\satellite_co.paa" -out "%OUTPUT%\the_bra.png"

echo Conversion complete!
pause
```

### Step 5: Generate Tiles from PNG

**Using ImageMagick:**

```cmd
cd C:\Temp\arma3_tiles

REM Create tile directories
mkdir cam_lao_nam\0\0
mkdir cam_lao_nam\1\0
mkdir cam_lao_nam\1\1
mkdir cam_lao_nam\2\0
mkdir cam_lao_nam\2\1
mkdir cam_lao_nam\2\2
mkdir cam_lao_nam\2\3

REM Cut image into 256x256 tiles
magick convert cam_lao_nam.png -crop 256x256 -set filename:tile "%%[fx:page.x/256]_%%[fx:page.y/256]" +repage +adjoin "cam_lao_nam/tiles/%%[filename:tile].png"
```

**Automated Tile Generation Script:**
```cmd
@echo off
set MAGICK="C:\Program Files\ImageMagick-7.1.0-Q16\magick.exe"
set INPUT=C:\Temp\arma3_tiles
set OUTPUT=C:\Users\YourUsername\Documents\sog-kneeboard\public\tiles

REM Cam Lao Nam (5120x5120)
%MAGICK% convert "%INPUT%\cam_lao_nam.png" -resize 5120x5120! -crop 256x256 -set filename:tile "%%[fx:page.x/256]_%%[fx:page.y/256]" +repage +adjoin "%OUTPUT%\cam_lao_nam\tiles\%%[filename:tile].png"

REM Khe Sanh (2048x2048)
%MAGICK% convert "%INPUT%\khe_sanh.png" -resize 2048x2048! -crop 256x256 -set filename:tile "%%[fx:page.x/256]_%%[fx:page.y/256]" +repage +adjoin "%OUTPUT%\khe_sanh\tiles\%%[filename:tile].png"

REM The Bra (1024x1024)
%MAGICK% convert "%INPUT%\the_bra.png" -resize 1024x1024! -crop 256x256 -set filename:tile "%%[fx:page.x/256]_%%[fx:page.y/256]" +repage +adjoin "%OUTPUT%\the_bra\tiles\%%[filename:tile].png"

echo Tile generation complete!
pause
```

### Step 6: Organize Tiles for Leaflet

Leaflet expects this structure:
```
public/tiles/
├── cam_lao_nam/
│   ├── 0/
│   │   └── 0/
│   │       └── 0.png
│   ├── 1/
│   │   ├── 0/
│   │   │   ├── 0.png
│   │   │   └── 1.png
│   │   └── 1/
│   │       ├── 0.png
│   │       └── 1.png
│   └── 2/
│       └── ... (more tiles)
```

**Reorganize Script:**
```cmd
@echo off
set SOURCE=C:\Temp\arma3_tiles\cam_lao_nam\tiles
set DEST=C:\Users\YourUsername\Documents\sog-kneeboard\public\tiles\cam_lao_nam

REM Create zoom level directories
for /L %%z in (0,1,4) do (
    mkdir "%DEST%\%%z"
)

REM Move tiles to correct structure
REM This requires custom logic based on tile naming
echo Manual organization required - see MAP_TILES_GUIDE.md
pause
```

---

## Alternative: Use Community Tools

### GRAD Map Export Helper

**Install:**
```cmd
git clone https://github.com/gruppe-adler/grad_meh.git
cd grad_meh
npm install
```

**Export Maps:**
```cmd
node index.js --world vn_cam_lao_nam --output ../sog-kneeboard/public/tiles/cam_lao_nam
node index.js --world vn_khe_sanh --output ../sog-kneeboard/public/tiles/khe_sanh
node index.js --world vn_the_bra --output ../sog-kneeboard/public/tiles/the_bra
```

---

## Quick Method: In-Game Screenshots

If extraction tools don't work:

### Step 1: Take Screenshots
1. Launch Arma 3 Editor
2. Load S.O.G. map
3. Open map view (M key)
4. Zoom to maximum
5. Take screenshots covering entire map
6. Screenshots saved to: `%USERPROFILE%\Documents\Arma 3\screenshots\`

### Step 2: Stitch Screenshots
Use image editing software:
- **Photoshop**: File → Automate → Photomerge
- **GIMP**: Filters → Distorts → Panorama Projection
- **Hugin**: Free panorama stitcher

### Step 3: Export as Tiles
Use ImageMagick (see Step 5 above)

---

## Testing Tiles

### Step 1: Copy Tiles to Project
```cmd
xcopy /E /I "C:\Temp\arma3_tiles\cam_lao_nam" "C:\Users\YourUsername\Documents\sog-kneeboard\public\tiles\cam_lao_nam"
```

### Step 2: Update Frontend Code

Edit `public/js/app.js`:
```javascript
// Add tile layer
const tileUrl = 'tiles/{mapName}/{z}/{x}/{y}.png';
const tileLayer = L.tileLayer(tileUrl, {
    minZoom: 0,
    maxZoom: 4,
    tileSize: 256,
    noWrap: true
});
tileLayer.addTo(map);
```

### Step 3: Test in Browser
```cmd
npm start
```
Open http://localhost:31337 and verify tiles load

---

## Troubleshooting

### PAA Conversion Fails
- Ensure Arma 3 Tools installed correctly
- Try Mikero's Tools instead: https://mikero.bytex.digital/Downloads
- Check PAA file isn't corrupted

### Tiles Don't Load
- Verify file paths match URL pattern
- Check browser console for errors
- Ensure PNG format (not PAA)
- Verify correct zoom levels

### Poor Quality
- Extract at higher resolution
- Use lossless PNG compression
- Increase tile size to 512x512

### Missing Satellite Images
- Some maps may not have satellite textures
- Use terrain textures instead
- Generate from in-game screenshots

---

## File Size Considerations

### Tile Storage Requirements
- **Cam Lao Nam**: ~500MB (all zoom levels)
- **Khe Sanh**: ~200MB
- **The Bra**: ~100MB
- **Total**: ~800MB for all maps

### Optimization Tips
1. **Reduce zoom levels** - Fewer levels = less storage
2. **Compress PNGs** - Use tools like pngquant
3. **Lower resolution** - 128x128 tiles instead of 256x256
4. **Selective maps** - Only include maps you use

---

## Legal Reminder

⚠️ **Important**: 
- Map tiles are Bohemia Interactive's intellectual property
- Only extract from your legal copy of Arma 3
- For personal use only
- Do not redistribute
- Respect Arma 3 EULA

---

## Summary

**Easiest Method**: Use GRAD Map Export Helper
**Most Control**: Manual extraction with Arma 3 Tools
**Quickest**: In-game screenshots + stitching

**Recommended**: Start without tiles, add later for visuals

The kneeboard works perfectly without tiles using coordinate-based positioning!

---

**Need Help?** Check MAP_TILES_GUIDE.md for more details.
