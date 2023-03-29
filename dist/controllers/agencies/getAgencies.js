"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const postgres_1 = __importDefault(require("../../models/db/postgres"));
function getAgencies(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const agencyQs = `
            SELECT
                id,
                name,
                admin,
                email,
                city,
                region,
                country_name,
                country_code,
                country_image,
                country_short,
                contact,
                contact_verified,
                email_verified
            FROM
                agencies;
        `;
        try {
            const queryResponse = yield postgres_1.default.query(agencyQs);
            const agencies = queryResponse.rows;
            return res.status(200).json(agencies);
        }
        catch (err) {
            console.log(err);
            return res.status(500).json({ message: "Internal; server error" });
        }
    });
}
exports.default = getAgencies;
