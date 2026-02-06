# Changelog

## [0.0.1] - 2024-05-20
### Added
- **Window System**: Full Desktop Window Manager (DWM) architecture.
- **Auto-Tiling**: Smart layout engine (Center, Split, Grid) based on active windows.
- **Ghost Admin**: Secure Terminal-based authentication (`Shift+L`).
- **Debris Optimization**: Hardware-accelerated background particles.
- **Admin Panel**: In-browser content management system.
- **Owner Guide**: Documentation for deployment and usage.

### Fixed
- **Performance**: Removed main-thread blocking animations.
- **UI Bugs**: Fixed overlapping menus and text contrast.
- **Security**: Removed insecure global boolean toggles.

### Changed
- Refactored `HUDCorner` to spawn `Window` instances instead of expanding.
- Updated styling to "Cyber/Void" aesthetic.
