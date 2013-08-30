///<reference path="../../def/angular.d.ts" />
///<reference path="../../def/angular.d.ts" />
///<reference path="../Config.ts" />

module EMD.Editor {

  emdEditorModule.directive('panel', () => new PanelDirective());
  emdEditorModule.directive('panelHeader', () => new PanelHeaderDirective());
  emdEditorModule.directive('panelBody', () => new PanelBodyDirective());
  emdEditorModule.directive('panelFooter', () => new PanelFooterDirective());

  class PanelDirective {
    public restrict:string = 'A';
    public transclude = true;
    public template:string = '<div class="panel-view">'+
        '<div class="panel-container">'+
        '<div class="panel" ng-transclude></div>'+
  '</div>'+
  '</div>';
  }

  class ReplacementDirective {
    public require = '^appPanel';
    public restrict = 'E';
    public transclude = true;
    public replace = true;

    constructor(public template: string) {

    }
  }

  class PanelHeaderDirective extends ReplacementDirective {
    constructor() {
      super("<div class='header'>" +
          "<div class='content' ng-transclude></div>" +
          "</div>")
    }
  }

  class PanelBodyDirective extends ReplacementDirective {
    constructor() {
      super("<div class='body'>" +
          "<div class='content' ng-transclude></div>" +
          "</div>")
    }
  }

  class PanelFooterDirective extends ReplacementDirective {
    constructor() {
      super("<div class='footer'>" +
          "<div class='content' ng-transclude></div>" +
          "</div>")
    }
  }
}