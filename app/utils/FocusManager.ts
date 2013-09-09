///<reference path="../../def/jquery.d.ts" />

/**
 * Utility classes
 */
module Utils {

  /**
   * Maintains focus for an element and its children
   */
  export class FocusManager {

    public static focusEvent = 'panel.return';
    private lastFocused: HTMLElement;

    constructor(private $element, private $scope) {

      $scope.$on(FocusManager.focusEvent, (e, originator) => {
        if (originator == this)
          return;

        e.stopPropagation();
        setTimeout(() => this.onFocusReturn(e), 10);
      });

      //$element.on(FocusManager.focusEvent, e => this.onFocusReturn(e));

      $element.on('$destroy', () => this.onDestroy());
      $element.on('keydown', e => this.onKeyDown(e));
      $element.on('click', e => {
        this.onFocusReturn(e);
        return false;
      });

      $element.attr('wantfocus', true);

      $element.focusin(e => this.onFocusIn(e));
      $element.focusout(e => this.onFocusOut(e));

      setTimeout(() => this.onInitialFocus(), 0);
    }

    /**
     * Called when we initially get focus
     */
    private onInitialFocus() {
      this.$element.find('[autofocus]').focus();
    }

    /**
     * Called when the scope is about to be destroyed
     */
    private onDestroy() {
      this.$scope.$emit(FocusManager.focusEvent, this);
      //this.$element.parent().trigger(FocusManager.focusEvent);
    }

    /**
     * Called when we regain focus from a child
     */
    private onFocusReturn(e) {


      if (this.$element.has(this.lastFocused).length > 0) {
        $(this.lastFocused).focus()
      } else {
        this.onInitialFocus();
      }
    }

    /**
     * Called when we focus on a child element
     */
    private onFocusIn(e) {
      var rootParent = $(e.target).closest("ui-view");

      // if the ui-view is a child of this element, that means the element is
      // a child of another scope, so ignore it
      if (this.$element.has(rootParent).length > 0)
        return;

      this.lastFocused = e.target;
      e.preventDefault();
      e.stopPropagation();
    }

    private onFocusOut(e) {

      e.preventDefault();
      e.stopPropagation();
    }

    /**
     * Called whenever we press a key and the element has focus
     * @param e
     */
    private onKeyDown(e) {

      switch (e.keyCode) {
        case 9:
          this.onTab(e);
          break;
        case 13:
          this.onEnter(e);
          break;
        case 27:
          this.onEscape(e);
          break;
      }
    }

    /**
     * Called when the escape key has been pressed
     * @param e
     */
    private onEscape(e) {
      this.click(this.$element.find('.close'));
      e.preventDefault();
      e.stopPropagation();
    }

    /**
     * Click an element (mimic left-click)
     */
    private click(element) {
      var event = jQuery.Event("click");
      event.which = 1;
      element.trigger(event);
    }

    /**
     * Called when the enter key has been pressed
     */
    private onEnter(e) {
      var focused = this.$element.find('[tabindex]:focus,:focus');

      if (focused.length > 0 && !focused.is("input")) {
        this.click(focused);
        console.log('clicked:');
        console.log(focused[0]);
      } else {
        this.$element.find('.btn-primary').click();
      }

      e.preventDefault();
      e.stopPropagation();
    }

    /**
     * Called when the tab key was pressed
     */
    private onTab(e) {

      var focusable = this.$element.find(':input:enabled:visible,[tabindex]')
          .not('.nofocus');

      var currentIndex = jQuery.makeArray(focusable).indexOf(document.activeElement);
      var increment = e.shiftKey ? -1 : 1;
      var nextIndex = currentIndex + increment;

      if (nextIndex < 0) {
        nextIndex = focusable.length - 1;
      } else if (nextIndex >= focusable.length) {
        nextIndex = 0;
      }

      $(focusable[nextIndex]).focus();

      e.preventDefault();
      e.stopPropagation();
    }

  }

}