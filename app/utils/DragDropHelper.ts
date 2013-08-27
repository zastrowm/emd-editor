
module Utils {

  export class DragDropHelper {

    /**
     * Create a new drag drop helper
     * @param element the element that items can be dropped onto
     */
        constructor(
        private element: HTMLElement,
        private action: (evt) => void,
        private overClass: string = 'drag'
        ) {

      var self = $(element);
      var collection = []

      self.on('dragenter', event => {
        if (collection.length === 0) {
          this.handleHoverStart(event);
        }
        collection.push(event.target);
      });

      self.on('dragleave', event => {
        setTimeout(() => {
          collection = collection.filter(e => e != event.target);
          if (collection.length === 0) {
            this.handleHoverEnd(event);
          }
        }, 1);
      });

      self.on('drop', event => {
        collection.length = 0;
      });

      element.addEventListener('dragover', evt => this.handleHoverOver(evt), false);
      element.addEventListener('drop', evt => this.handleDrop(evt), false);
    }

    private handleHoverOver(evt) {
      evt.stopPropagation();
      evt.preventDefault();
      evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    }

    private handleHoverStart(evt) {
      evt.stopPropagation();
      evt.preventDefault();

      this.element.classList.add(this.overClass);
    }

    private handleHoverEnd(evt){
      evt.stopPropagation();
      evt.preventDefault();

      this.element.classList.remove(this.overClass);
    }

    private handleDrop(evt){
      evt.stopPropagation();
      evt.preventDefault();

      this.action(evt);
      this.handleHoverEnd(evt);
    }
  }

}
