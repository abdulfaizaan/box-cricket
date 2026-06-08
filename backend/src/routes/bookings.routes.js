"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bookings_controller_1 = require("../controllers/bookings.controller");
const router = (0, express_1.Router)();
router.post('/', bookings_controller_1.createBooking);
exports.default = router;
//# sourceMappingURL=bookings.routes.js.map