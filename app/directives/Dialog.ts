///<reference path="Directive.ts" />
///<reference path="../Utils/FocusManager.ts" />

module EmbeddedMarkdown.Editor {

  /**
   * An element whose elements are converted to multiple divs
   */
  class Dialog extends ReplaceDirective {

    constructor(private $timeout) {
      super();
    }

    public getTemplate(): string {
      return '' +
          '<div class="dialog-view">'+
              '<div class="dialog" ng-transclude>' +
            '</div>'+
          '</div>';
    }

    public setup($scope, $element, $transclude): void {
      //$element.find('.panel > .container').append($transclude().children());
    }

    public linkElement($scope, $element, $attributes) {
      new Utils.FocusManager($element, $scope);

            if ($attributes.size) {
        $element.find('.dialog').addClass($attributes.size);
      }
    }
  }

  EMD.Editor.emdEditorModule.directive("xdialog", ($timeout) => new Dialog($timeout));
}