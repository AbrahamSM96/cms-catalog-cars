# Changelog

All notable changes to this project are documented in this file.

This file is generated automatically by [git-cliff](https://git-cliff.org) on
every push to `main`. **Do not edit it by hand** — it is rewritten on every
release. To change what shows up here, change the commit message (see
[CONTRIBUTING.md](./CONTRIBUTING.md)).

Versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
While the project is pre-1.0, `feat` bumps the minor version and `fix` bumps the
patch version.

## 0.1.0 (2026-09-24)

Baseline: everything built before releases were automated. Commit messages
from this era predate the convention, so some entries are grouped loosely and
`Other` holds the ones with no type prefix at all.

### Features

- Add /docs directory to .gitignore to exclude documentation files from version control ([f88ae90](https://github.com/AbrahamSM96/cms-catalog-cars/commit/f88ae90483f0c1e9b3c0c7fa80b1d088e7a410c4))
- Implement fuzzy search for car suggestions in search bar ([52998b6](https://github.com/AbrahamSM96/cms-catalog-cars/commit/52998b69c7876345d37f8ae5a7d737465c3196be))
- Implement custom error and not found screens with enhanced user experience ([c20dcc4](https://github.com/AbrahamSM96/cms-catalog-cars/commit/c20dcc4b51270e25fccf726fa617290864b7877c))
- Add SimilarCars component with carousel functionality and fetch similar cars logic ([bdb5489](https://github.com/AbrahamSM96/cms-catalog-cars/commit/bdb5489d0692647dfc2aac30681531c33d8c79b2))
- **migrations:** Add leads table and related enums ([8c0611e](https://github.com/AbrahamSM96/cms-catalog-cars/commit/8c0611e452d6eb0ffe9c04e7bba78e7b0821744f))
- Refine login.css styles for improved layout and responsiveness ([e04a606](https://github.com/AbrahamSM96/cms-catalog-cars/commit/e04a60607d6cda2a71b38b3b4b478de0d64c823c))
- Enhance AdminDashboardHero component with internationalization support and improved copy management ([8a9bb91](https://github.com/AbrahamSM96/cms-catalog-cars/commit/8a9bb916be37c233811c85a067786719d66a43aa))
- Update .gitignore to track payload-types.ts and add build-time placeholder for PAYLOAD_SECRET in Dockerfile ([ff362bc](https://github.com/AbrahamSM96/cms-catalog-cars/commit/ff362bce41c777f58914df3215d703186ab291aa))
- Update .gitignore to include .payload-types.ts file ([d4cc940](https://github.com/AbrahamSM96/cms-catalog-cars/commit/d4cc940a53a4777a0d47a405b95be2cd62434374))
- Update .gitignore to exclude generated payload-types.ts file ([d1063e7](https://github.com/AbrahamSM96/cms-catalog-cars/commit/d1063e7bdd563f9fd12609f8909289af0cb76afc))
- Enhance access control logic for users without roles and null checks ([7da9173](https://github.com/AbrahamSM96/cms-catalog-cars/commit/7da9173182a48449d5ccdfbe8c8e69b8c34706d4))
- Implement VIN panel with styling and localization updates ([65cb150](https://github.com/AbrahamSM96/cms-catalog-cars/commit/65cb150b237632c989107cea12fcfba3387720b0))
- Add cookie capture script and integrate Playwright for session management ([c3b7fe0](https://github.com/AbrahamSM96/cms-catalog-cars/commit/c3b7fe04bf79bdcabe97e523674c80f4f692d4f7))
- **migrations:** Add optional version column to cars table ([459b4c8](https://github.com/AbrahamSM96/cms-catalog-cars/commit/459b4c837cb61cae8251caf34c24718b0979e17a))
- Add vehicle catalog scraping script and update .gitignore ([b9b33a9](https://github.com/AbrahamSM96/cms-catalog-cars/commit/b9b33a923adcf6e686e6a08b46495b3bf587b22f))
- Add new components for home sections and UI elements ([eaf620e](https://github.com/AbrahamSM96/cms-catalog-cars/commit/eaf620e756c9813fde484dd2ccffd53c76378328))
- Add minimumCacheTTL for improved image caching in R2 configuration ([7e52331](https://github.com/AbrahamSM96/cms-catalog-cars/commit/7e52331daa8d1172d1f91247d98b5715a2f8f8dd))
- Remove Inter font integration and update Poppins font weights for improved typography ([1518bd7](https://github.com/AbrahamSM96/cms-catalog-cars/commit/1518bd7923972a2b37c5fb7085430ea30889fbfa))
- Add sizesVariant prop to CarCard and CarGrid components, update FeaturedCars to use grid size preset ([9c2b780](https://github.com/AbrahamSM96/cms-catalog-cars/commit/9c2b7809d525dbdaabf92482f9e8136b17807605))
- Enhance brand color validation and serialization, update environment variable handling, and improve JSON-LD security ([19127bc](https://github.com/AbrahamSM96/cms-catalog-cars/commit/19127bce79a7fecc4200c9b40f102f7d61040c2a))
- Add admin dashboard hero component for inventory overview ([73c8c7f](https://github.com/AbrahamSM96/cms-catalog-cars/commit/73c8c7fd4630876c6338179f92ae8e213000ec02))
- Add Google Maps coordinates handling for dealerships ([c7ce74b](https://github.com/AbrahamSM96/cms-catalog-cars/commit/c7ce74bb62012f00037cb584da9fa5475e5c3e53))
- Add runbook for applying migrations in production ([6740f49](https://github.com/AbrahamSM96/cms-catalog-cars/commit/6740f499ec810096e482d16e0e8e104cafb1d773))
- **migrations:** Add cities migration to replace free text city names with a structured document model ([9e33e71](https://github.com/AbrahamSM96/cms-catalog-cars/commit/9e33e71bea7b4a99ccc6875dbec460ff5c6cf551))
- Add second Render Blueprint configuration for testing environment ([5c98b85](https://github.com/AbrahamSM96/cms-catalog-cars/commit/5c98b85281eb711b584aa0d9f48228644668722c))
- Add Render Blueprint configuration for CMS deployment ([239dcc9](https://github.com/AbrahamSM96/cms-catalog-cars/commit/239dcc9c5b97e026e8115108806f4daec29d3426))
- Remove prefetching from various links for improved performance and consistency ([b562ddf](https://github.com/AbrahamSM96/cms-catalog-cars/commit/b562ddfa36a96abe0180a79990adbfcb8365abb9))
- Implement ShareButton and ShareSheet components for enhanced sharing functionality ([ed35f7d](https://github.com/AbrahamSM96/cms-catalog-cars/commit/ed35f7d83e0bd0bdb66e199499e7dc865beba440))
- Enhance ImageGallery with touch and keyboard navigation support ([1d10e86](https://github.com/AbrahamSM96/cms-catalog-cars/commit/1d10e86b78f28ea215d209c8dfcbba6f767e0d75))
- Add prefetching to various links for improved navigation performance ([0c035d8](https://github.com/AbrahamSM96/cms-catalog-cars/commit/0c035d8ae727c32d026463a6870b607998b84309))
- Add MapLibre worker setup and update build scripts for worker management ([fb2b05b](https://github.com/AbrahamSM96/cms-catalog-cars/commit/fb2b05b13517c2b7fb62ecf01a52229a2fecc8c4))
- Implement SMTP email adapter for password reset functionality and update environment configuration ([80a6c6e](https://github.com/AbrahamSM96/cms-catalog-cars/commit/80a6c6ef941c4acd9782d95072277d26f1dd1a30))
- Update linting rules and improve component state management across various components ([1cb1643](https://github.com/AbrahamSM96/cms-catalog-cars/commit/1cb1643aa57616ded3090c5d4df2bebba0115414))
- **migrations:** Add new columns to site_settings for brand visibility and media logo ([4945bc0](https://github.com/AbrahamSM96/cms-catalog-cars/commit/4945bc08c55fec97f9611b0d956347a6bee76412))
- Add tests for buildCarImageSlug and logoNeedsDarkPlate functions; implement R2 server and utility tests ([e2436d5](https://github.com/AbrahamSM96/cms-catalog-cars/commit/e2436d5ca6b85651704a9dc8e656a85e9fe69359))
- Add logo contrast detection to conditionally render dark plates for logos ([db5a31b](https://github.com/AbrahamSM96/cms-catalog-cars/commit/db5a31bd861ff8d2e346b407f170afc3f0784b35))
- Update Map components to use type imports from maplibre-gl and add new dependency for style specifications ([41ed3c4](https://github.com/AbrahamSM96/cms-catalog-cars/commit/41ed3c4cc7da6a317b434fee82ec5b9eb807b049))
- Implement BrandLogo component and update layout to use it in Navbar and Footer ([de8af46](https://github.com/AbrahamSM96/cms-catalog-cars/commit/de8af464cd35a340ef099d67fa8bc80d99127e17))
- Add toId function for consistent handling of Payload document ids ([0ee8337](https://github.com/AbrahamSM96/cms-catalog-cars/commit/0ee8337f77ff6e668bcf7b54548c665ca00ec167))
- **migrations:** Add initial migration for car catalog schema ([6300529](https://github.com/AbrahamSM96/cms-catalog-cars/commit/6300529b03b758c7ba2c0cca5425d43f945f095b))
- Add build arguments for NEXT_PUBLIC_R2_PUBLIC_URL and NEXT_PUBLIC_SITE_URL in Dockerfile and docker-compose.yml ([36a8d3b](https://github.com/AbrahamSM96/cms-catalog-cars/commit/36a8d3bb0131ea4b8987fb74cc213926acc43b50))
- Add graphify output to .gitignore to prevent committing symlink ([b5eae0a](https://github.com/AbrahamSM96/cms-catalog-cars/commit/b5eae0a9ae2949b1dfeeeae5a873a657703712fc))
- Implement transmission detection logic and integrate with VersionField component ([275c9c6](https://github.com/AbrahamSM96/cms-catalog-cars/commit/275c9c61d098d960438ddcb234d7f07914e77523))
- Replace Cloudinary with S3 storage integration and update next.config for R2 bucket support ([6719555](https://github.com/AbrahamSM96/cms-catalog-cars/commit/67195559ba6ddb3cca563d8b61d416074afb4212))
- Update color scheme to use accent colors throughout the frontend ([29aa162](https://github.com/AbrahamSM96/cms-catalog-cars/commit/29aa1623d015974c8f735a2f378510e32b551f20))
- Enhance SEO and structured data across various pages, add site URL configuration ([d8d06b1](https://github.com/AbrahamSM96/cms-catalog-cars/commit/d8d06b1edbf17c0d02e9fd43e4ed780dd10fbe43))
- Enhance access control for collections and add role-based permissions ([d3b0116](https://github.com/AbrahamSM96/cms-catalog-cars/commit/d3b01169db0854eb03c6d96d311a650440e376c5))
- Add vehicle catalog seed data and types for brands, models, and versions ([49af148](https://github.com/AbrahamSM96/cms-catalog-cars/commit/49af148fd6f429e91e44b136f7eece83d9c06dfa))
- Linter and oxlint ([7634f24](https://github.com/AbrahamSM96/cms-catalog-cars/commit/7634f2489e34701157b6e3c9b5cd4e7a9b33035a))
- Add geo and hours utilities, enhance payload client with dealerships and contact fetching ([63f3f1d](https://github.com/AbrahamSM96/cms-catalog-cars/commit/63f3f1d7bfcaf19d3261e1e008f11df16b896ee0))
- Add Docker Compose setup for local development with PostgreSQL ([732bee6](https://github.com/AbrahamSM96/cms-catalog-cars/commit/732bee65ef953e90e4ea18a17860f910559f9804))
- Add .env.example for environment variable configuration; update .gitignore to exclude all .env files ([c9034d9](https://github.com/AbrahamSM96/cms-catalog-cars/commit/c9034d91b4d6ceef1d7d4511b640a02c489ad221))

### Bug Fixes

- Specify return type for cleanup function in ImageGallery component ([c17ded8](https://github.com/AbrahamSM96/cms-catalog-cars/commit/c17ded84950a18ad780eb1abb913d44d0b5e4371))

### Refactors

- Update logo contrast handling to use tone classification ([0380e95](https://github.com/AbrahamSM96/cms-catalog-cars/commit/0380e950e0b7adb1f3733c8213c83932c1f32376))
- Update spacing and padding across various components for improved layout consistency ([e229cf3](https://github.com/AbrahamSM96/cms-catalog-cars/commit/e229cf38d3def7b072d3c90cd9908e8424e22b5b))

### Chores

- Update eslint configuration and dependencies ([b900854](https://github.com/AbrahamSM96/cms-catalog-cars/commit/b90085412cf5175a5b3b6e569e7943cc90d23218))
- Update package.json with new scripts and dependency versions ([233d8c3](https://github.com/AbrahamSM96/cms-catalog-cars/commit/233d8c3eb373c2ce82c324f4a344a17ea2c31c1e))
- Update ESLint configuration and add testing libraries ([d1b5324](https://github.com/AbrahamSM96/cms-catalog-cars/commit/d1b53243e69a1a29d6c7e75ecf1cd13f7cae1806))
- Update ESLint configuration and add Vitest setup ([aec01ce](https://github.com/AbrahamSM96/cms-catalog-cars/commit/aec01ce5513d1316e9cc94571a38c52b250bf71e))
- Update next and eslint-config-next to latest versions ([6625d52](https://github.com/AbrahamSM96/cms-catalog-cars/commit/6625d52959be5f9234f6ebedbca5a70323f7649f))
- Update package.json with new linting and formatting scripts; upgrade dependencies including Next.js and Payload CMS ([97a22b9](https://github.com/AbrahamSM96/cms-catalog-cars/commit/97a22b94b2b7543aadec3c8e154af55d62feb95e))

### Other

- Add ViewOnSiteButton component and integrate with Cars collection for live preview ([51f983c](https://github.com/AbrahamSM96/cms-catalog-cars/commit/51f983cbdcc3db711cd6156996f02586225bb945))
- Add migration to update cars table with reserve fields ([955138b](https://github.com/AbrahamSM96/cms-catalog-cars/commit/955138b92cca9dad2116abb7285916e8390e9196))
- Disable image cropping and focal point in Media upload configuration ([fd70aca](https://github.com/AbrahamSM96/cms-catalog-cars/commit/fd70acabe5e7f2a5e9a3db46f2d960aa4689f115))
- Add reservation feature with configurable options for car listings ([f0720b6](https://github.com/AbrahamSM96/cms-catalog-cars/commit/f0720b660bbfab413511b1650a854e4d4b2165df))
- Add analytics configuration options for Umami and Google Analytics ([843182c](https://github.com/AbrahamSM96/cms-catalog-cars/commit/843182c24d93b144d50a39f2585d7ceebd5e159d))
- Implement Google Analytics and Umami tracking providers with dynamic script loading ([5f59f62](https://github.com/AbrahamSM96/cms-catalog-cars/commit/5f59f62eddeeca59f9106ffe57f9b033c8519340))
- Add Badge component for consistent UI styling in HomePage and Hero ([a179131](https://github.com/AbrahamSM96/cms-catalog-cars/commit/a179131cb8200af0152c5b6af0f35898ee8c0fa2))
- Add migration to extend media table with new size-related fields ([a287aa6](https://github.com/AbrahamSM96/cms-catalog-cars/commit/a287aa66852e3fe0b67d80b1af6a00a42c1f0f4e))
- Refactor code structure for improved readability and maintainability, spanish language on cms ([f29b6ac](https://github.com/AbrahamSM96/cms-catalog-cars/commit/f29b6acf0bcd428189798088c4eb727f190bce67))
- Translate application text from Spanish to English across various components, collections, and configuration files for improved accessibility and user experience. Update labels, descriptions, and comments to reflect the changes, ensuring consistency in terminology and clarity in communication. ([c659b03](https://github.com/AbrahamSM96/cms-catalog-cars/commit/c659b03a6722fce7c589771743cf7c991965246e))
- Migrate email functionality from SMTP to Resend API and update environment configuration ([b9b365d](https://github.com/AbrahamSM96/cms-catalog-cars/commit/b9b365d8831d2717aa62b52cda5d17f4dc7b74b8))
- Update package versions to fixed versions for consistency and stability ([12c59f6](https://github.com/AbrahamSM96/cms-catalog-cars/commit/12c59f651a85d9bb938b90387386411a684edc64))
- Enhance seeding process with concurrency and improved error handling ([3ef2741](https://github.com/AbrahamSM96/cms-catalog-cars/commit/3ef274161fee0445d6696d5f2684b4834db86abf))
- Update SITE_URL fallback logic to prevent ERR_INVALID_URL on missing build variable ([8548293](https://github.com/AbrahamSM96/cms-catalog-cars/commit/8548293f035dfad545663e82b0e0b86c53539c1c))
- Implement dynamic database URI resolution for different environments ([954018f](https://github.com/AbrahamSM96/cms-catalog-cars/commit/954018f02cdf7eb18cfc174be3b39b113fbfd6fc))
- Add SWC dependencies for improved performance and compatibility ([0d21a9c](https://github.com/AbrahamSM96/cms-catalog-cars/commit/0d21a9c9e9c4db6d8bc72d069108ba74de3b8dcd))
- Implement site configuration for branding, SEO, and theming across components ([e85434a](https://github.com/AbrahamSM96/cms-catalog-cars/commit/e85434a5e58f5f18d958e6ae89bd67c931ec8e61))
- Update ESLint configuration to include .mts files, enhance Vitest setup with coverage options ([33b8e1a](https://github.com/AbrahamSM96/cms-catalog-cars/commit/33b8e1ad9d3a3c9d87b0b8355cd13b2a0061d472))
- Implement access control for Users collection with admin and self access rules ([cacad06](https://github.com/AbrahamSM96/cms-catalog-cars/commit/cacad06cba7b2ba06f80e8357b6cca19ec9a8552))
- Initial commit from Create Next App ([6351a12](https://github.com/AbrahamSM96/cms-catalog-cars/commit/6351a12da3621d2fd3e590fcdbd2a30094aa3cb9))
