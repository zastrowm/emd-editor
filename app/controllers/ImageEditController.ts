/// <reference path="zController.ts" />
///<reference path="../EmdDocument.ts"/>
///<reference path="../EditAppService.ts" />

module EmbeddedMarkdown.Editor {

  /**
   * Allows for editing of images
   */
  export class ImageEditController extends Controller {

    /**
     * The image that is currently being edited
     */
    public image: EmbeddedMarkdown.Image;

    /**
     * The original name of the image
     */
    public originalName: string;

    /**
     * The new name of the image
     */
    public newName: string;

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

      this.originalName = this.image.name;
      this.newName = this.image.name;
    }

    /**
     * Go back to the image document
     */
    public onCancel(): void {
      this.go("images");
    }

    /**
     * Save the changes made
     */
    public onOkay(): void {
//      console.log("Saving edited image");
//
//      if (this.newName != this.image.name) {
//        var images = this.app.documents.current.document.images;
//        var data = this.image.data;
//
//        images.remove(this.image);
//        images.add(this.newName, new EmbeddedMarkdown.Image(this.newName, data));
//      }

      this.go('images');
    }

    public canSave(): boolean {
      return this.isNameUnique()
    }

    public isNameUnique() {
      var images = this.app.documents.current.document.images;
      var otherImage = images.get(this.newName);
      return otherImage == null || otherImage == this.image;
    }

  }
}