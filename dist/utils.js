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
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRarity = exports.rarityToNumber = void 0;
function rarityToNumber(rarity) {
    return __awaiter(this, void 0, void 0, function* () {
        let rarityName;
        if (rarity === 'random') {
            rarityName = getRandomRarity();
        }
        else {
            rarityName = rarity;
        }
        if (rarityName === 'common') {
            return 1;
        }
        if (rarityName === 'uncommon') {
            return 2;
        }
        if (rarityName === 'rare') {
            return 3;
        }
        if (rarityName === 'legendary') {
            return 4;
        }
        else {
            return 5;
        }
    });
}
exports.rarityToNumber = rarityToNumber;
function getRandomRarity() {
    const random = Math.random();
    if (random < 0.539) {
        return 'common';
    }
    else if (random < 0.539 + 0.30) {
        return 'uncommon';
    }
    else if (random < 0.539 + 0.30 + 0.15) {
        return 'rare';
    }
    else if (random < 0.539 + 0.30 + 0.15 + 0.01) {
        return 'legendary';
    }
    else {
        return 'divine';
    }
}
function isRarity(value) {
    return ['random', 'common', 'uncommon', 'rare', 'legendary', 'divine'].includes(value);
}
exports.isRarity = isRarity;
