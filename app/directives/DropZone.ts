///<reference path="Directive.ts" />

module EmbeddedMarkdown.Editor {

  /**
   * The drop zone directive that allows files to be dropped onto an element.
   * Use:
   * <div zdropzone ondrop='functionToCall(files)'>
   *   <other-stuff />
   * </div>
   */
  class DropZone extends Directive {

    constructor(private $parse) {
      super();

      this.restriction = DirectiveRestriction.attributes;
    }

    public linkElement($scope, $element, $attributes) {
      // create a function from the "onfiledrop" attribute
      var onDropFunction = this.$parse($attributes.onfiledrop)

      new DropZoneElement($element, (data) => onDropFunction($scope, data));
    }
  }

  /**
   * Handles all the drop-zone logic
   */
  class DropZoneElement {

    constructor(private $element, private scopeOnDrop: (data: any) => void) {
      $element.on("dragover", false);
      $element.on("dragenter", false);

      // on drop, call the ondrop method with the files
      $element.on('drop', (evt) => this.onDrop(evt));
    }

    /**
     * Called when we drop files onto the drop zone
     * @param evt the event that occurred
     */
    private onDrop(evt) {

      // jquery event
      evt.stopPropagation();
      evt.preventDefault();

      // convert it to the natural event
      var mouseEvt = <any>((<any>evt).originalEvent);

      if (mouseEvt.dataTransfer != null
          && mouseEvt.dataTransfer.files != null
          && mouseEvt.dataTransfer.files.length > 0)
      {
        var files: FileList = mouseEvt.dataTransfer.files;
        this.scopeOnDrop({files: files});
      }
    }
  }

  Directive.register("zdropzone", ($parse) => new DropZone($parse))

  /*
    Have dragdrop for the entire app setup (this allows file drops to not
    cause the UI to change
   */
  $(function() {
    var dropZone = document.getElementsByTagName("body")[0];
    dropZone.addEventListener('dragover', evt => {
      evt.stopPropagation();
      evt.preventDefault();
    }, false);
    dropZone.addEventListener('drop', evt => {
      //evt.stopPropagation();
      //evt.preventDefault();
      console.log(evt.target)
    }, false);
  });

}