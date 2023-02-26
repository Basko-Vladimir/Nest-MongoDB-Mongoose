"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.CreatePostForBlogDto = void 0;
var class_validator_1 = require("class-validator");
var constants_1 = require("../../common/constants");
var is_not_empty_content_validator_1 = require("../../common/validators/is-not-empty-content.validator");
var MAX_TITLE_LENGTH = constants_1.postsConstants.MAX_TITLE_LENGTH, MAX_SHORT_DESCRIPTION_LENGTH = constants_1.postsConstants.MAX_SHORT_DESCRIPTION_LENGTH, MAX_CONTENT_LENGTH = constants_1.postsConstants.MAX_CONTENT_LENGTH;
var CreatePostForBlogDto = /** @class */ (function () {
    function CreatePostForBlogDto() {
    }
    __decorate([
        (0, class_validator_1.Length)(constants_1.MIN_STRINGS_LENGTH, MAX_TITLE_LENGTH),
        (0, is_not_empty_content_validator_1.IsNotEmptyContent)(),
        (0, class_validator_1.IsString)()
    ], CreatePostForBlogDto.prototype, "title");
    __decorate([
        (0, class_validator_1.Length)(constants_1.MIN_STRINGS_LENGTH, MAX_SHORT_DESCRIPTION_LENGTH),
        (0, is_not_empty_content_validator_1.IsNotEmptyContent)(),
        (0, class_validator_1.IsString)()
    ], CreatePostForBlogDto.prototype, "shortDescription");
    __decorate([
        (0, class_validator_1.Length)(constants_1.MIN_STRINGS_LENGTH, MAX_CONTENT_LENGTH),
        (0, is_not_empty_content_validator_1.IsNotEmptyContent)(),
        (0, class_validator_1.IsString)()
    ], CreatePostForBlogDto.prototype, "content");
    return CreatePostForBlogDto;
}());
exports.CreatePostForBlogDto = CreatePostForBlogDto;