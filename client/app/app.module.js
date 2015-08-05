String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

var app = angular.module('imageApp', ['ngRoute', 'ui.bootstrap', 'angularSpinner', 'ngTagsInput', 'autocomplete', 'ngLoad', 'angular-table', 'angular-jqcloud', 'angularFileUpload']);

