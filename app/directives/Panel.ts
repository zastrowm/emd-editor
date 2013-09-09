///<reference path="Directive.ts" />
///<reference path="../utils/FocusManager.ts" />

module EmbeddedMarkdown.Editor {

  /**
   * An element whose elements are converted to multiple divs
   */
  class Panel extends ReplaceDirective {

    constructor(private $timeout) {
      super();
    }

    public getTemplate(): string {
      return '' +
          '<div class="panel-view">'+
            '<div class="panel-container">'+
              '<div class="panel">' +
                '<div class="content-container" ng-transclude></div>' +
              '</div>'+
            '</div>'+
          '</div>';
    }

    public linkElement($scope, $element, $attributes) {
      new Utils.FocusManager($element, $scope);
    }
  }

  EMD.Editor.emdEditorModule.directive("xpanel", ($timeout) => new Panel($timeout));
}