/**
 * Backward-compatible barrel for the legacy `@/app/actions` import path.
 *
 * The actual implementations now live in domain-specific modules under
 * `app/actions/*`. New callers should import from those directly; this
 * file exists only so existing import sites keep working.
 */

export {
    getFeaturedCars,
    createCar,
    updateCar,
    deleteCar,
} from './actions/cars';

export {
    createCustomer,
    updateCustomer,
} from './actions/customers';

export { createRental } from './actions/rentals';
export { createMaintenance } from './actions/maintenance';

export {
    createOption,
    deleteOption,
    updateOption,
    createOptionGroup,
    deleteOptionGroup,
} from './actions/options';

export {
    getCarCategories,
    createCarCategory,
    updateCarCategory,
    deleteCarCategory,
} from './actions/categories';

export {
    fixDatabaseSchema,
    runDiagnostics,
    testUpdateCarAction,
} from './actions/diagnostics';

export { updateCompetitorPrices } from './actions/competitor-pricing';
export { updateSystemSetting } from './actions/system';
export { getGoogleReviews } from './actions/reviews';

