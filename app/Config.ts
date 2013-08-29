
///<reference path="../def/ace.d.ts" />
///<reference path="../def/angular.d.ts" />

module EMD.Editor {

  export var emdEditorModule = angular.module('EMD.Editor.App', ['ui.state']);

  emdEditorModule.factory('editors', function() {
    var EditorsService = {
      markdownEditor: <AceAjax.Editor>$('#core-editor').data('editor')
    };

    return EditorsService;
  });

  emdEditorModule.factory('actions', function($state) {

    var ActionsService = {

      go: function(actionName: string, toParams:any = {}) {

        $state.transitionTo(actionName, toParams,
            {
              location: true,
              inherit: true,
              relative: $state.$current
            });

      }

    };

    return ActionsService;
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

    state = state.state('images.edit', {
      url: "/edit/:id",
      templateUrl: "views/images.edit.html"
    });
  })






}

