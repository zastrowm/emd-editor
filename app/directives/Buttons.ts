///<reference path="Directive.ts" />

module EmbeddedMarkdown.Editor {

  class Button extends Directive {

    constructor(private definition: ButtonDefinition) {
      super();
      this.restriction = DirectiveRestriction.attributes;
    }

    public linkElement($scope, $element, $attributes): void {

      // only register if we don't have a ui-sref attribute
      if (!$attributes.uiSref) {
        $element.click((e) => this.handleClick(e, $scope));
      }

      if (this.definition.classes != null) {
        this.definition.classes.forEach(c => $element.addClass(c));
      }

      this.register($element);

      if ($attributes.text != null) {
        $element.text($attributes.text);
      } else if (this.definition.html != null) {
        $element.html(this.definition.html);
      } else if (this.definition.text != null) {
        $element.text(this.definition.text);
      }

      function capitaliseFirstLetter(str){
        return str.charAt(0).toUpperCase() + str.slice(1);
      }

      this.definition.click = capitaliseFirstLetter(this.definition.click);
    }

    public register($element): void {

    }

    private handleClick(e, $scope): void {
      $scope.$apply(() => {
        $scope.handleButtonAction('on' + this.definition.click);
      });

      e.preventDefault();
      e.stopPropagation();

    }
  }

  interface ButtonDefinition {
    html?: string;
    text?: string;

    classes: string[];
    click: string;
  }

  function register(name: string, definition: ButtonDefinition) {
    Directive.register(name, () => new Button(definition));
  }

  register('xclose', {
    html: "&times",
    click: "cancel",
    classes: ['close', 'nofocus']
  });

  register('xcancel', {
    text: "Cancel",
    click: "cancel",
    classes: ['btn']
  });

  register('xokay', {
    text: "Okay",
    click: "okay",
    classes: ['btn', 'btn-primary']
  });

  register('xsave', {
    text: "Save",
    click: "save",
    classes: ['btn', 'btn-primary']
  });
}