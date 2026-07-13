# Changelog

## [0.3.0](https://github.com/birdflop/web/compare/v0.2.0...v0.3.0) (2026-07-07)

### Features

- Fonts for RGB tool ([0cfff23](https://github.com/birdflop/web/commit/0cfff23da711066b9a5f34e37a85c6b2b584333f)), closes [#224](https://github.com/birdflop/web/issues/224)
- implement small text font transformation ([86b1b91](https://github.com/birdflop/web/commit/86b1b91d65d906f41247c845132c98f0832917f4))
- new color list with more compact ui and drag-and-drop handles ([63a1763](https://github.com/birdflop/web/commit/63a1763b845cac33d0e4083537966dabadc0251d))
- smarter hex code generation with check for if same color per letter ([30d52e6](https://github.com/birdflop/web/commit/30d52e65966b910e75b55309bb603a3466934d8b))
- translate untranslated keys and clean up code formatting ig ([31003fd](https://github.com/birdflop/web/commit/31003fd70b7b53ed2670714dba4c2249eeee0c82))

### Code Refactoring

- abstract gradient preview rendering and clean up AnimTAB frame generation logic, fix cookie issues ([4827f1a](https://github.com/birdflop/web/commit/4827f1a5257f3a5662bac9be4e9ad254491733a5))
- consolidate segment color editing logic into the reusable ColorList component ([15319b6](https://github.com/birdflop/web/commit/15319b6261119abf83bba6802e9f4edff4bc7ffd))
- decompose RGBirdflop component and centralize state management via RGBirdflopBase ([89aff16](https://github.com/birdflop/web/commit/89aff167b8ddebf358956a1adf3dad5f8cecedeb))
- decouple advanced segments and rgb options state across the advanced RGB editor component suite. ([ea02f8a](https://github.com/birdflop/web/commit/ea02f8a2a7c40a485158f094f8ba0efdbbe8d49e))
- introduce BasePlugin class, modularize oxlint ignores, and extract JVM flag analysis logic ([186e2e7](https://github.com/birdflop/web/commit/186e2e75c670e99bead01dd2b3b84e2d39357d2c))

## [0.2.0](https://github.com/birdflop/web/compare/v0.1.17...v0.2.0) (2026-07-01)

### Features

- enhance formatting capabilities in AnimTAB and share formatting utils properly ([c4296bf](https://github.com/birdflop/web/commit/c4296bf8cdba32628702e7655f0cef9aa2a1f111))
- implement selective character-level formatting for templates, MiniMessage, and JSON outputs ([14ced97](https://github.com/birdflop/web/commit/14ced97cdf3fd415519e72e9da4ae3dc2fbaf21d))
- rename defaultFormatting to baseFormatting ([1933580](https://github.com/birdflop/web/commit/1933580aeb5bd80341be1006ce6dcbd67192dc69))
- update formatting to work on selection ([32afe89](https://github.com/birdflop/web/commit/32afe890e36e2f18617abfc959bf7939b861245f))

### Code Refactoring

- extract JSON generation logic into reusable helper functions in RGBUtils ([3a88375](https://github.com/birdflop/web/commit/3a88375683f7bca843d37ac3a8ccf46bffcdb963))

### Bug Fixes

- handle potential undefined rgb values in BaseGradient class ([f259f0e](https://github.com/birdflop/web/commit/f259f0e37de7fca1bc533126fab1a693651d30f4))
- improve color position calculation for disperseColors and getOutput functions ([b1feab6](https://github.com/birdflop/web/commit/b1feab641ef70d1d750c2bf554bcd3e6b0b9deee))
- make typescript shut up ([f31d300](https://github.com/birdflop/web/commit/f31d300297e96b5c53642a8c058d803ca08a5a6a))

## [0.1.17](https://github.com/birdflop/web/compare/v0.1.16...v0.1.17) (2026-03-09)

### Features

- add invertRgbColor function ([1e25f81](https://github.com/birdflop/web/commit/1e25f8171b93af2a94938ad0de2e6e5dc582f102))

## [0.1.16](https://github.com/birdflop/web/compare/v0.1.15...v0.1.16) (2026-03-09)

### Features

- enhance shadow color handling by adding opacity support and updating related components ([b1d9b23](https://github.com/birdflop/web/commit/b1d9b2339536328cd472c0bd692ac39f81a69b2f))
- enhance shadow segment handling by adding opacity support in buildShadowSegments and buildShadowContent ([d34e65a](https://github.com/birdflop/web/commit/d34e65af36b1eeb9b5d822ee05569e739dc884ca))
- refactor color handling to use RGBColorStop type and improve opacity management in gradients ([0bdbf24](https://github.com/birdflop/web/commit/0bdbf24e21620eab8bb987addd1ee7d0d3658818))

### Code Refactoring

- enhance documentation for RGBColorStop type to clarify properties ([152bf1b](https://github.com/birdflop/web/commit/152bf1b2e6bda44687af978b18c88c412e99b544))
- update gradient color handling to ensure RGB values are correctly sliced ([686e99b](https://github.com/birdflop/web/commit/686e99be2e1770c852004e1c0aacfa29c9c78af9))

## [0.1.15](https://github.com/birdflop/web/compare/v0.1.14...v0.1.15) (2026-01-28)

### Bug Fixes

- update README and documentation for RGBirdflop NPM package usage examples and formatting ([ca5d3d3](https://github.com/birdflop/web/commit/ca5d3d3e87c7b794abb85d7d506ec5bf692705ae))
- update usage example in README.md ([3c847f7](https://github.com/birdflop/web/commit/3c847f78d768f03687a0ddb624c35a5825435026))

## [0.1.14](https://github.com/birdflop/web/compare/v0.1.13...v0.1.14) (2026-01-28)

### Bug Fixes

- add repository field to package.json ([bd95fff](https://github.com/birdflop/web/commit/bd95fff9b644ecafff1d6c9eda0e8c149c63bd0d))
- pls work ([9e44336](https://github.com/birdflop/web/commit/9e44336a7769a5e5d578e735e3d6a16f2b483806))

## [0.1.13](https://github.com/birdflop/web/compare/v0.1.12...v0.1.13) (2026-01-28)

### Bug Fixes

- i hate you npm ([715c42b](https://github.com/birdflop/web/commit/715c42bcc9a5b3bffd484aaee95d9a505ce455de))

## [0.1.12](https://github.com/birdflop/web/compare/v0.1.11...v0.1.12) (2026-01-28)

### Bug Fixes

- update usage example in README with valid RGB values ([8da36ad](https://github.com/birdflop/web/commit/8da36adbae7022d747ec53ad7f9ce8cdbc5471aa))

## [0.1.11](https://github.com/birdflop/web/compare/v0.1.10...v0.1.11) (2026-01-28)

### Bug Fixes

- update usage example in README ([d403b13](https://github.com/birdflop/web/commit/d403b13374c9636d5a59134152fc19165c93ce1f))

## [0.1.10](https://github.com/birdflop/web/compare/v0.1.9...v0.1.10) (2026-01-28)

### Bug Fixes

- trigger ci attempt [#7](https://github.com/birdflop/web/issues/7) ([e8f7559](https://github.com/birdflop/web/commit/e8f7559723d1252a83c49363802fe7e78093995e))

## [0.1.9](https://github.com/birdflop/web/compare/v0.1.8...v0.1.9) (2026-01-28)

### Bug Fixes

- trigger ci ([fac5159](https://github.com/birdflop/web/commit/fac5159ab8d2076bd90cd82460bc7e606754d0a1))

## [0.1.8](https://github.com/birdflop/web/compare/v0.1.7...v0.1.8) (2026-01-28)

### Bug Fixes

- bruh why do you hate me npm ([2caf92e](https://github.com/birdflop/web/commit/2caf92e3b73bcd9f0612d2e38f606e96dfe4e870))
- test publish ([dbf3257](https://github.com/birdflop/web/commit/dbf325770bd5608074db5060ba873732e08418b0))

## [0.1.7](https://github.com/birdflop/web/compare/v0.1.6...v0.1.7) (2026-01-28)

### Bug Fixes

- wasnt a typo ([d4e3a61](https://github.com/birdflop/web/commit/d4e3a61c63f6e8494e8329d0e5ce2c8a0825bdfb))

## [0.1.6](https://github.com/birdflop/web/compare/v0.1.5...v0.1.6) (2026-01-28)

### Bug Fixes

- totally a typo ([a26e77c](https://github.com/birdflop/web/commit/a26e77cfdee47c74979d42db47772bc38140ae7e))

## [0.1.5](https://github.com/birdflop/web/compare/v0.1.4...v0.1.5) (2026-01-28)

### Documentation

- Update README title for RGBirdflop package ([be57c8b](https://github.com/birdflop/web/commit/be57c8b1c146d40f4957004d68dde750280cc985))

## [0.1.4](https://github.com/birdflop/web/compare/v0.1.3...v0.1.4) (2026-01-28)

### Documentation

- update import statement in usage example for RGBirdflop package ([fa41541](https://github.com/birdflop/web/commit/fa415418bf1d6971cc0c05bd7b5a871178457d3b))

## [0.1.3](https://github.com/birdflop/web/compare/v0.1.2...v0.1.3) (2026-01-28)

### Documentation

- update usage example in README for RGBirdflop package ([ef0f9e8](https://github.com/birdflop/web/commit/ef0f9e8657ab6955762c7dad13126e1601879248))

## [0.1.2](https://github.com/birdflop/web/compare/v0.1.1...v0.1.2) (2026-01-28)

### Code Refactoring

- add safety checks for empty colors array ([0055aac](https://github.com/birdflop/web/commit/0055aac9941d01d3fa60a887d95a53153e56b65d))
- remove registry URL from package.json and update release workflow ([5d0a59a](https://github.com/birdflop/web/commit/5d0a59abfc5c4e51f7213c5bbee0860bbe902bd9))
- update release workflow and improve README for RGBirdflop package ([14158e8](https://github.com/birdflop/web/commit/14158e83e38bd37005662fa8a51759a713212ab6))

## [0.1.1](https://github.com/birdflop/web/compare/v0.1.0...v0.1.1) (2026-01-06)

### Features

- Add CIELAB color space utilities and gradient classes for CIELAB and LCh(ab) ([52de4b7](https://github.com/birdflop/web/commit/52de4b78c2e3734dd09772898307fc5e3a71af81))
- Add HSL color space utilities and integrate HSL gradients into ColorGradient ([4d87b6f](https://github.com/birdflop/web/commit/4d87b6f3939546258a9121c73a650d68b39cd1b4))
- add OKLAB color space utilities and refactor vectorize to use them ([fa6d937](https://github.com/birdflop/web/commit/fa6d9370a4c576c14bccac669f23f7f223df16ad))
- Add showAllGradients context and integrate gradient type selection in RGB and animation components ([e0fa97a](https://github.com/birdflop/web/commit/e0fa97a3b2c4310262bf55ea9b775be5198c7d68))
- implement base gradient classes and refactor existing gradient types to minimize duplicate code ([c915f2d](https://github.com/birdflop/web/commit/c915f2d1a2525d309b2e52ac8ffc2519ae6f7c5d))
- Implement gradient classes for RGB, OKLAB, and OKLCh color spaces ([74d0b6d](https://github.com/birdflop/web/commit/74d0b6debc5f02fad7ad75e4ec2d8cf9ed2f6873))
- initialize rgbirdflop package with core functionality ([1726472](https://github.com/birdflop/web/commit/1726472e15bc9cf1d886241500ef8d3ea4910f19))
- integrate rgbirdflop package and update related components ([a24ef43](https://github.com/birdflop/web/commit/a24ef430ca03207bf9b480be168feb1c27e31705))

### Bug Fixes

- handle optional shadow colors in generateOutput function ([69b9713](https://github.com/birdflop/web/commit/69b971319ce8e5165421af1b53f2b2a9a007e81f))
- round color positions to three decimal places for consistency ([b11040f](https://github.com/birdflop/web/commit/b11040f6e20f1fc72ea6ad876a1cb5dc7e33bfd4))
- update version from 0.1.0 to 0.2.0 in package.json ([9338e58](https://github.com/birdflop/web/commit/9338e58cde69958dc7aa0285b9797101fc1e8a09))

### Code Refactoring

- streamline color handling logic and remove unused shadow color references ([743bdf6](https://github.com/birdflop/web/commit/743bdf69fdee15eb7b8b34c6cf17c6235791abe8))
- use getshadowcolor for color list ([f6ae60f](https://github.com/birdflop/web/commit/f6ae60f611cd69ecd9dce6f346bcec24e45f8bef))
