# Yabegami Gallery

# 🌌 Yabegami Online Store - The Pixel Factory 

Welcome to the heart of the **Yabegami** community! This repository serves, indexes, and delivers dynamic live wallpapers directly to Linux desktops worldwide. 

Whether you love building complex shaders, designing interactive HTML5 canvas animations, or looping smooth 4K videos, **your work belongs here!**

---

## 📂 Repository Structure & How to Contribute

To keep the store fast, organized, and scalable, we use a single root `manifest.json` file to register everything. Your wallpaper folder should be completely self-contained and placed right at the root.

Here is what the repository layout looks like:

```text
.
├── manifest.json              <-- The central registry (Every wallpaper must be listed here)
├── Blackhole/                 <-- Example of a minimal Web Wallpaper
│   └── index.html
├── Fireflies/                 <-- Example of a standard Web Wallpaper
│   ├── fireflies.css
│   ├── fireflies.js
│   └── index.html
└── Fluid/                     <-- Example of a feature-rich interactive Wallpaper
    ├── index.html
    ├── fluid.jpg              <-- Thumbnail used in the online library UI
    ├── js/
    │   └── script.js
    └── assets/
```

### Step 1: Register your creation in manifest.json
When you submit a new wallpaper, you must add its configuration entry into the main manifest.json array at the root of this repository.

Here is how to structure your entry block:

```json
{
  "id": "your-unique-wallpaper-id",
  "title": "Neon Sunset Drive",
  "description": "An interactive audio-responsive neon horizon.", // Optional, great for context!
  "type": "web",                                                // "web" (HTML/JS) or "video" (MP4/WebM)
  "path": "Neon_Sunset_Drive",                                  // The exact name of your root folder
  "entry": "index.html",                                        // Your main entry file inside that folder
  "thumbnail": "Neon_Sunset_Drive/fluid.jpg"                    // Path to your preview image (Recommended)
}
```

###  Step 2: Set up your project folder
path: Ensure your folder name uses standard alphanumeric characters, underscores (_), or dashes (-). Avoid spaces.

entry: This is the execution target. For instance, if it's a web project, it will open index.html. If it's a raw looped background video, it can point straight to your_video.mp4.

thumbnail: Provide a clean image preview (ideally an optimized .jpg or .png, roughly 400x250px) so users can browse it smoothly in the online store UI.

## Golden Rules for Creators
Zero CDNs, Full Offline Support: Just like the Yabegami client, your live wallpaper must run entirely without an active internet connection. Please bundle all your external libraries (like Three.js, Anime.js, Google Fonts, etc.) locally inside your asset directory!

Performance First: We absolutely love crisp visuals, but if your wallpaper pegs the CPU at 100% or leaks memory, laptop batteries will melt. Always profile your canvas elements, asset file sizes, and rendering loops! 😉

Respect Copyright: Only submit original work or assets bound to open-source licenses. Make sure you have full rights to distribute your shared media.

## Join the Open-Source Team! 
Yabegami is a fast-growing, ambitious utility driven by pure community passion. Whether you are a professional graphics developer, an open-source hobbyist, or just starting out with web animations, we would love your help!

# How to push your contribution:
- Fork this repository.
- Create your dedicated asset folder at the root and build your interactive wallpaper or video loop.
- Append your configuration object to the global manifest.json file.
- Open a Pull Request explaining your visual concept.

We can't wait to see your developer handle and creations added to the official Yabegami library index. Let's make Linux desktops gorgeous, one pixel at a time!

