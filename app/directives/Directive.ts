
///<reference path="../../def/angular.d.ts" />
///<reference path="../Config.ts" />

module EmbeddedMarkdown.Editor {

  export enum DirectiveRestriction {
    any,
    elements,
    attributes,
    classes,
    comments
  }

  /**
   * A class which allows creating new elements or attributes
   */
  export class Directive {

    /**
     * The priority of the directive
     */
    public priority: number;
    public restrict = 'E';
    public replace: boolean;
    public transclude: any;

    public controller: any;
    public link: any;

    public template: string;

    /**
     * Constructor
     */
    constructor() {
      var setupCallback = (s,e,t) => this.setup(s,e,t);
      var linkCallback = (s,e,a) => this.linkElement(s, e, a);

      this.controller = function($scope, $element, $transclude) {
        setupCallback($scope, $element, $transclude);
      }

      this.link = function($scope, $element, $attributes) {
        linkCallback($scope, $element, $attributes);
      }

    }

    /**
     * Set where the directive can be used
     * @param value
     */
    public set restriction(value: DirectiveRestriction) {
      switch (value) {
        case DirectiveRestriction.any:
          this.restrict = 'EACM';
          break;
        case DirectiveRestriction.attributes:
          this.restrict = 'A';
          break;
        case DirectiveRestriction.classes:
          this.restrict = 'C';
          break;
        case DirectiveRestriction.elements:
          this.restrict = 'E';
          break;
        case DirectiveRestriction.comments:
          this.restrict = 'M';
          break;
      }
    }


    /**
     * Do any setup needed on the element.  Equivalent to the controller property for angular
     */
    public setup($scope, $element, $transclude): void {

    }

    /**
     * Link the element and perform any event registrations.  Equivalent to the link property for angular
     */
    public linkElement($scope, $element, $attributes: any): void {

    }

    /**
     * Register a directive to be used by the system
     * @param name the name of the directive
     * @param factory a function that creates the directive
     */
    public static register(name: string, factory: (...args: any[]) => Directive) {
      EMD.Editor.emdEditorModule.directive(name, factory);
    }
  }

  /**
   * A directive where the contents are replaced by a template
   */
  export class ReplaceDirective extends Directive {

    /**
     * Constructor
     */
    constructor() {
      super();
      this.replace = true;
      this.template = this.getTemplate();
      this.transclude = true;
    }

    /**
     * Get the template used in the replacement
     * @returns {string} the template as a string
     */
    public getTemplate(): string {
      return "";
    }

  }
}
