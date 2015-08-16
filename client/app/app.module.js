String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

var app = angular.module('imageApp', ['ngRoute', 'ui.bootstrap', 'angularSpinner', 'ngTagsInput', 'autocomplete', 'ngLoad', 'angular-table', 'angular-jqcloud', 'angularFileUpload', 'ngJcrop']);


app.config(function(ngJcropConfigProvider){

    // [optional] To change the jcrop configuration
    // All jcrop settings are in: http://deepliquid.com/content/Jcrop_Manual.html#Setting_Options
    ngJcropConfigProvider.setJcropConfig({
        bgColor: 'black',
        bgOpacity: .4,
        aspectRatio: 1
    });

    // [optional] To change the css style in the preview image
    ngJcropConfigProvider.setPreviewStyle({
        'width': '100px',
        'height': '100px',
        'overflow': 'hidden',
        'margin-left': '5px'
    });

});