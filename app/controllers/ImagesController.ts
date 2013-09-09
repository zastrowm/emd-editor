///<reference path="AppController.ts" />
///<reference path="../EmdDocument.ts" />
///<reference path="../../def/jquery.d.ts" />
///<reference path="../EditAppService.ts" />
///<reference path="zController.ts" />
///<reference path="../application/files/Path.ts" />
///<reference path="../application/files/FilePath.ts" />

module EmbeddedMarkdown.Editor {

  interface FilenameParts {
    name: string;

    extension: string;
  }

  /**
   * Handles the images
   */
  export class ImagesController extends Controller {
    private images: EmbeddedMarkdown.Image[];

    /**
     * Create a new menu controller
     * @param $scope the scope for which the controller is active
     */
    constructor($scope: any, private editApp: EmbeddedMarkdown.Editor.EditAppService){
      super($scope);

      this.images = editApp.documents.current.images;
    }

    /**
     * Called when we click on an image
     * @param image the image that was clicked
     */
    public handleImageClick(image: EmbeddedMarkdown.Image) {
      this.editApp.actions.go("images.edit", {id: image.name});
    }

    public handleFileSelect(files: FileList) {

      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        if (file.type.indexOf('image/') !== 0)
         continue;

        this.addFile(file);
      }
    }

    public editImage(image: EmbeddedMarkdown.Image) {
      this.go("images.edit.rename", {id: image.name});
    }

    public deleteImage(image: EmbeddedMarkdown.Image) {
      this.go("images.edit.delete", {id: image.name});
    }

    /**
     * Add a file to the list of images (if it is an image)
     */
    private addFile(file: File) {
      var filePath = Application.Files.Path.parseFilePath(decodeURI(file.name));

      if (!this.isValidFileType(filePath))
        return;

      this.convertBlockToBase64(file, base64 => {
        this.addFileWithName(filePath, base64);
      });
    }

    private isValidFileType(filePath: Application.Files.FilePath): boolean {

      switch (filePath.extension.toLowerCase()) {
        case "png":
        case "jpeg":
        case "jpg":
        case "bmp":
          return true;
        default:
          return false;
      }
    }

    /**
     * Add a file with a specific name
     * @param filename the name of the file to add
     * @param data the data associated with the file
     */
    private addFileWithName(filePath: Application.Files.FilePath, data:string) {

      var name = filePath.name;

      var images = this.editApp.documents.current.document.images;

      var i = 2;
      while (images.contains(filePath.toString())) {
        filePath.name = name + " (" + i + ")";
        i++;

        // make sure we don't enter infinite loop
        if (i > 100000) {
          return;
        }
      }

      var fullData =  "data:image/" + filePath.extension.toLowerCase() + ";base64," + data;
      var newImage = new EmbeddedMarkdown.Image(filePath.toString(), fullData);

      this.editApp.documents.current.document.images.add(newImage.name, newImage);

      this.apply();
    }

    public onCancel() {
      this.go('edit');
    }

    /**
     * Convert a blob to a base64 string
     * @param blob the blob to convert
     * @param callback the callback that gets executed with the first argument
     * containing the converted base64 string
     */
    private convertBlockToBase64(blob, callback) {
      var reader = new FileReader();
      reader.onload = () => {
        var dataUrl = reader.result;
        var base64 = dataUrl.split(',')[1];
        callback(base64);
      };
      reader.readAsDataURL(blob);
    }
  }

}
