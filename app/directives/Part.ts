
///<reference path="Directive.ts" />

module EmbeddedMarkdown.Editor {

  /**
   * An element whose elements are converted to multiple divs and allows a
   * class to be assigned as well.
   *
   * Usage:
   *   <xpart as="body">
   *     <b>Text and stuff</b>
   *   </xpart>
   *
   * Will be converted to:
   *  <div class="body">
   *    <div class='container'>
   *      <div class='content'></div>
   *    </div>"
   *  </div>";
   */
  class PartDirective extends ReplaceDirective {

    public priority = 100;

    public getTemplate(): string {
      return '' +
          "<div>" +
          "<div class='content-container'><div class='content' ng-transclude></div></div>" +
          "</div>";
    }

    public setup($scope, $element, $transclude): void {
      //$element.find('.container > .content').append($transclude());
    }

    public linkElement($scope: any, $element: any, $attributes: any): void {
      if ($attributes.as != null) {
        $element.addClass($attributes.as);
      }
    }
  }

  Directive.register("xpart", () => new PartDirective());
}