/// <reference path="zController.ts" />
///<reference path="../EmdDocument.ts"/>
///<reference path="../EditAppService.ts" />

module EmbeddedMarkdown.Editor {

  /**
   * Allows for editing of images
   */
  export class ImageDeleteController extends Controller {

    /**
     * The image that is currently being edited
     */
    public image: EmbeddedMarkdown.Image;

    /**
     * @param $scope the scope for the controller
     * @param $stateParams
     * @param editApp
     */
    constructor($scope) {
      super($scope);

      var images = this.app.documents.current.document.images;
      var imageId = this.app.state.id;

      this.image = images.get(imageId);

      if (this.image == null)
      {
        this.onCancel();
        return;
      }
    }

    /**
     * Go back to the image document
     */
    public onCancel(): void {
      this.go("images.edit", {id: this.image.name});
    }

    /**
     * Delete the image
     */
    public onOkay(): void {
      var images = this.app.documents.current.document.images.remove(this.image);
      this.go('images');
    }
  }
}