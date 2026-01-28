# Changelog

## [0.1.2](https://github.com/birdflop/web/compare/v0.1.1...v0.1.2) (2026-01-28)


### Code Refactoring

* add safety checks for empty colors array ([0055aac](https://github.com/birdflop/web/commit/0055aac9941d01d3fa60a887d95a53153e56b65d))
* remove registry URL from package.json and update release workflow ([5d0a59a](https://github.com/birdflop/web/commit/5d0a59abfc5c4e51f7213c5bbee0860bbe902bd9))

## [0.1.1](https://github.com/birdflop/web/compare/v0.1.0...v0.1.1) (2026-01-06)


### Features

* Add CIELAB color space utilities and gradient classes for CIELAB and LCh(ab) ([52de4b7](https://github.com/birdflop/web/commit/52de4b78c2e3734dd09772898307fc5e3a71af81))
* Add HSL color space utilities and integrate HSL gradients into ColorGradient ([4d87b6f](https://github.com/birdflop/web/commit/4d87b6f3939546258a9121c73a650d68b39cd1b4))
* add OKLAB color space utilities and refactor vectorize to use them ([fa6d937](https://github.com/birdflop/web/commit/fa6d9370a4c576c14bccac669f23f7f223df16ad))
* Add showAllGradients context and integrate gradient type selection in RGB and animation components ([e0fa97a](https://github.com/birdflop/web/commit/e0fa97a3b2c4310262bf55ea9b775be5198c7d68))
* implement base gradient classes and refactor existing gradient types to minimize duplicate code ([c915f2d](https://github.com/birdflop/web/commit/c915f2d1a2525d309b2e52ac8ffc2519ae6f7c5d))
* Implement gradient classes for RGB, OKLAB, and OKLCh color spaces ([74d0b6d](https://github.com/birdflop/web/commit/74d0b6debc5f02fad7ad75e4ec2d8cf9ed2f6873))
* initialize rgbirdflop package with core functionality ([1726472](https://github.com/birdflop/web/commit/1726472e15bc9cf1d886241500ef8d3ea4910f19))
* integrate rgbirdflop package and update related components ([a24ef43](https://github.com/birdflop/web/commit/a24ef430ca03207bf9b480be168feb1c27e31705))


### Bug Fixes

* handle optional shadow colors in generateOutput function ([69b9713](https://github.com/birdflop/web/commit/69b971319ce8e5165421af1b53f2b2a9a007e81f))
* round color positions to three decimal places for consistency ([b11040f](https://github.com/birdflop/web/commit/b11040f6e20f1fc72ea6ad876a1cb5dc7e33bfd4))
* update version from 0.1.0 to 0.2.0 in package.json ([9338e58](https://github.com/birdflop/web/commit/9338e58cde69958dc7aa0285b9797101fc1e8a09))


### Code Refactoring

* streamline color handling logic and remove unused shadow color references ([743bdf6](https://github.com/birdflop/web/commit/743bdf69fdee15eb7b8b34c6cf17c6235791abe8))
* use getshadowcolor for color list ([f6ae60f](https://github.com/birdflop/web/commit/f6ae60f611cd69ecd9dce6f346bcec24e45f8bef))
