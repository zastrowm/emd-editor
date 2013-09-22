
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
    $urlRouterProvider.otherwise("edit")
    //
    // Now set up the states
    var state: any = $stateProvider;

    var put = (stateName: string, url: string, templateUrl?: string) => {

      if (templateUrl == null) {
        templateUrl = "views/" + stateName + ".html";
      }

      state = state.state(stateName, {
        url: url,
        templateUrl: templateUrl
      });
    }


    state = state.state('edit', {
      url: '/edit',
      template: ""
    });

    // images
    put("images", "/images");
    put("images.edit", "/edit/:id");
    put("images.edit.rename", "/rename");
    put("images.edit.delete", "/delete");

    // files
    put("open", "/open", "views/open.html");
  })






}

