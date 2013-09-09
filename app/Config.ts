
///<reference path="application/files/LocalStorage.ts" />
///<reference path="EditAppService" />
///<reference path="ActionsService.ts" />

///<reference path="../def/ace.d.ts" />
///<reference path="../def/angular.d.ts" />

module EMD.Editor {

  export var emdEditorModule = angular.module('EMD.Editor.App', ['ui.router']);

  emdEditorModule.factory('editors', function() {
    var EditorsService = {
      markdownEditor: <AceAjax.Editor>$('#core-editor').data('editor')
    };

    return EditorsService;
  });

  emdEditorModule.factory('actions', $state =>
      new EmbeddedMarkdown.Editor.ActionsService($state));

  emdEditorModule.factory("editApp", function(editors, actions, $stateParams) {
    return new EmbeddedMarkdown.Editor.EditAppService(editors, actions, $stateParams);
  });

  emdEditorModule.config(function($stateProvider, $urlRouterProvider){
    //
    // For any unmatched url, send to /
    $urlRouterProvider.otherwise("")
    //
    // Now set up the states
    var state: any = $stateProvider;

    state = state.state('edit', {
      url: '/edit',
      template: ""
    });

    state = state.state('images', {
      url: "/images",
      templateUrl: "views/images.html"
    });

    state = state.state('images.edit', {
      url: "/edit/:id",
      templateUrl: "views/images.edit.html"
    });

    state = state.state('images.edit.rename', {
      url: "/rename",
      templateUrl: "views/images.edit.rename.html"
    });

    state = state.state('images.edit.delete', {
      url: "/delete",
      templateUrl: "views/images.edit.delete.html"
    });
  })






}

