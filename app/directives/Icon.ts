///<reference path="Directive.ts" />

module EmbeddedMarkdown.Editor {

  class Icon extends ReplaceDirective {

    constructor(private $parse) {
      super();

      this.transclude = "element";
    }

    public linkElement($scope, $element, $attributes): void {
      $element.addClass('xicon-' + $attributes.name)
      $element.attr('title', $attributes.text);
      $element.attr('name', null);
      $element.attr('text', null);

      var clickFunction = this.$parse($attributes.click)

    }

    public getTemplate() : string {
      return "<span></span>";
    }

  }

  Directive.register('xicon', ($parse) => new Icon($parse));
}