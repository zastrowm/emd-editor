
///<reference path="../def/ace.d.ts" />
///<reference path="../def/angular.d.ts" />

module EMD.Editor {

  var emdEditorModule = angular.module('EMD.Editor.App', ['ui.state']);

  emdEditorModule.factory('editors', function() {
    var EditorsService = {
      markdownEditor: <AceAjax.Editor>$('#core-editor').data('editor')
    };

    return EditorsService;
  });


  emdEditorModule.config(function($stateProvider, $urlRouterProvider){
    //
    // For any unmatched url, send to /
    $urlRouterProvider.otherwise("")
    //
    // Now set up the states
    var state: any = $stateProvider;

    state = state.state('edit', {
      url: '',
      template: ""
    });

    state = state.state('images', {
      url: "/images",
      templateUrl: "views/images.html"
    });
  })
}