"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const slots_controller_1 = require("../controllers/slots.controller");
const router = (0, express_1.Router)();
router.get('/', slots_controller_1.getSlots);
exports.default = router;
//# sourceMappingURL=slots.routes.js.map